/**
 * Core AI service functions for generating assistant responses
 */

import type OpenAI from 'openai';
import * as chatService from './chat';
import * as roadmapService from './roadmap';
import { createChatCompletion } from './openai';
import { calculateProgress, getEffectiveStatus, getNextUpcomingStep } from './stepStatus';
import { formatDateTime, formatRelativeDate } from './dateUtils';
import type { CareStep, ChatMessage } from '@/types/database';
import type { RoadmapWithSteps } from './roadmap';

export interface AIResponseResult {
  message: ChatMessage | null;
  error: chatService.ChatError | null;
}

const SYSTEM_PROMPT = [
  'You are CareGuide AI, a friendly virtual care navigation assistant.',
  'Provide clear, empathetic, and actionable guidance based on the patient\'s care roadmap information.',
  'Use the supplied context about the patient\'s roadmaps and steps. If specific details are missing, acknowledge that.',
  'Do not provide medical diagnoses or urgent medical advice. Encourage the patient to contact their healthcare provider for medical concerns.',
  'Keep responses concise, focus on next steps, preparation, and helpful reminders. Clarify any assumptions you make.',
].join(' ');

const MAX_HISTORY_MESSAGES = 12;

/**
 * Generate an AI response given the latest user message
 */
export async function generateAIResponse(
  userMessage: string,
  patientId: string,
  roadmapId?: string | null
): Promise<AIResponseResult> {
  if (!patientId) {
    return {
      message: null,
      error: { message: 'Missing patient information for AI response.' },
    };
  }

  try {
    const [contextSummary, historyResult] = await Promise.all([
      buildPatientContext(patientId, roadmapId),
      chatService.getChatHistory(patientId, roadmapId),
    ]);

    const historyMessages = historyResult.error
      ? []
      : historyResult.messages.slice(-MAX_HISTORY_MESSAGES);

    const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      historyMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Ensure the latest user prompt is included
    if (
      conversationMessages.length === 0 ||
      conversationMessages[conversationMessages.length - 1].role !== 'user'
    ) {
      conversationMessages.push({
        role: 'user',
        content: userMessage,
      });
    }

    const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: contextSummary
        ? `${SYSTEM_PROMPT}\n\nPatient Context:\n${contextSummary}`
        : SYSTEM_PROMPT,
    };

    const completionResult = await createChatCompletion([
      systemMessage,
      ...conversationMessages,
    ]);

    if (completionResult.error || !completionResult.content) {
      return {
        message: null,
        error: completionResult.error ?? {
          message: 'Failed to generate AI response. Please try again.',
        },
      };
    }

    const saveResult = await chatService.saveMessage(
      patientId,
      'assistant',
      completionResult.content,
      roadmapId || null,
      null
    );

    if (saveResult.error) {
      return {
        message: null,
        error: saveResult.error,
      };
    }

    return {
      message: saveResult.message,
      error: null,
    };
  } catch (error: any) {
    return {
      message: null,
      error: {
        message: error?.message || 'Unexpected error generating AI response.',
      },
    };
  }
}

async function buildPatientContext(
  patientId: string,
  roadmapId?: string | null
): Promise<string> {
  try {
    if (roadmapId) {
      const detailResult = await roadmapService.getRoadmapWithSteps(roadmapId);
      if (detailResult.error || !detailResult.roadmap) {
        return '';
      }
      return formatRoadmapContext(detailResult.roadmap);
    }

    const roadmapsResult = await roadmapService.getRoadmaps(patientId);
    if (roadmapsResult.error || roadmapsResult.roadmaps.length === 0) {
      return roadmapsResult.error
        ? ''
        : 'No care roadmaps are currently associated with this patient.';
    }

    const activeRoadmaps = roadmapsResult.roadmaps.filter(
      (roadmap) => roadmap.status === 'active'
    );

    const focusRoadmap = activeRoadmaps[0] ?? roadmapsResult.roadmaps[0];
    const detailResult = await roadmapService.getRoadmapWithSteps(focusRoadmap.id);

    const overviewLines = [
      `Patient has ${roadmapsResult.roadmaps.length} care roadmap(s).`,
      activeRoadmaps.length
        ? `Active roadmap(s): ${activeRoadmaps
            .map((roadmap) => `"${roadmap.title}"`)
            .join(', ')}.`
        : `No roadmaps are currently marked active. Most recent roadmap: "${focusRoadmap.title}".`,
    ];

    if (detailResult.error || !detailResult.roadmap) {
      return overviewLines.join(' ');
    }

    return `${overviewLines.join(' ')}\n${formatRoadmapContext(detailResult.roadmap)}`;
  } catch (error) {
    console.error('Failed to build patient context', error);
    return '';
  }
}

function formatRoadmapContext(roadmap: RoadmapWithSteps): string {
  const { steps } = roadmap;

  if (!steps || steps.length === 0) {
    return `Roadmap "${roadmap.title}" (${roadmap.status}) has no recorded steps yet.`;
  }

  const progress = calculateProgress(steps);
  const nextStep = getNextUpcomingStep(steps);

  const lines: string[] = [
    `Roadmap "${roadmap.title}" is currently ${roadmap.status}. Overall progress is ${progress}%.`,
  ];

  if (nextStep) {
    lines.push(formatNextStepSummary(nextStep));
  } else {
    lines.push('All steps in this roadmap appear to be completed.');
  }

  lines.push('Key steps:');

  const MAX_STEPS_IN_CONTEXT = 5;
  const stepSummaries = steps.slice(0, MAX_STEPS_IN_CONTEXT).map(formatStepSummary);
  lines.push(...stepSummaries);

  if (steps.length > MAX_STEPS_IN_CONTEXT) {
    lines.push(
      `...and ${steps.length - MAX_STEPS_IN_CONTEXT} additional step(s) not listed here.`
    );
  }

  return lines.join('\n');
}

function formatNextStepSummary(step: CareStep): string {
  const scheduleInfo = getScheduleSummary(step);
  const providerInfo = step.provider_name
    ? ` Provider: ${step.provider_name}${
        step.provider_phone ? ` (${step.provider_phone})` : ''
      }.`
    : '';

  const prepInfo = step.prep_instructions
    ? ` Prep instructions: ${step.prep_instructions}.`
    : '';

  return [
    `Next step: "${step.title}" needs attention.`,
    scheduleInfo ? ` Timing: ${scheduleInfo}.` : '',
    providerInfo,
    prepInfo,
  ]
    .join('')
    .trim();
}

function formatStepSummary(step: CareStep): string {
  const statusLabel = humanizeStatus(getEffectiveStatus(step));
  const scheduleInfo = getScheduleSummary(step);
  const parts: string[] = [
    `- ${step.title}`,
    `status: ${statusLabel}`,
  ];

  if (scheduleInfo) {
    parts.push(`when: ${scheduleInfo}`);
  }

  if (step.prep_instructions) {
    parts.push(`prep: ${step.prep_instructions}`);
  }

  return parts.join(' | ');
}

function getScheduleSummary(step: CareStep): string | null {
  if (step.scheduled_date) {
    return `${formatRelativeDate(step.scheduled_date)} (${formatDateTime(
      step.scheduled_date
    )})`;
  }

  if (step.due_date) {
    return `${formatRelativeDate(step.due_date)} due date`;
  }

  return null;
}

function humanizeStatus(status: ReturnType<typeof getEffectiveStatus>): string {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'overdue':
      return 'overdue';
    case 'in_progress':
      return 'in progress';
    default:
      return 'pending';
  }
}


