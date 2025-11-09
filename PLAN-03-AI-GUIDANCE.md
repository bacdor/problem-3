# Plan 03: AI-Driven Guidance Chatbot

## Overview
Build an AI-powered chatbot interface that answers patient questions about their care journey, provides guidance on next steps, and sends proactive alerts for important actions.

## Objectives
- Create chat interface with message history
- Integrate OpenAI API (GPT-4/GPT-3.5) for intelligent responses
- Implement context-aware responses using patient's roadmap data
- Add proactive alerts and suggestions
- Store chat history in Supabase
- Provide helpful, healthcare-focused responses

## Implementation Steps

### 1. OpenAI Integration Setup
**Files to create:**
- `lib/openai.ts` - OpenAI client configuration and utilities
- `.env` - Add `OPENAI_API_KEY` (user needs to add their key)

**OpenAI Client:**
- Initialize OpenAI client using `openai` npm package
- Read API key from environment variables
- Create helper functions for chat completions
- Handle API errors gracefully

**Dependencies to install:**
```bash
npm install openai
```

### 2. Chat Data Layer
**Files to create:**
- `lib/chat.ts` - Chat message CRUD operations
- `hooks/useChat.ts` - React hook for chat functionality
- `hooks/useChatHistory.ts` - Hook for loading chat history

**Functions needed:**
- `getChatHistory(patientId, roadmapId?)` - Fetch chat messages
- `saveMessage(patientId, role, content, roadmapId?, stepId?)` - Save message to DB
- `subscribeToChatUpdates(patientId, callback)` - Real-time chat updates

**Message Context:**
- Link messages to specific roadmaps/steps when relevant
- Store user and assistant messages
- Include timestamps for message ordering

### 3. AI Prompt Engineering
**File to create:**
- `lib/aiPrompts.ts` - Prompt templates and system messages

**System Prompt:**
- Define AI role as healthcare navigation assistant
- Set tone: helpful, clear, empathetic
- Include instructions about using patient's roadmap context
- Emphasize accuracy and directing to providers for medical advice

**Context Building:**
- `buildContextForRoadmap(roadmap, steps)` - Create context string from roadmap data
- `buildContextForStep(step)` - Create context string for specific step
- Include relevant step details, dates, prep instructions in context

**Prompt Templates:**
- General question prompt
- Step-specific question prompt
- Next steps suggestion prompt
- Alert generation prompt

### 4. Chat Interface Components
**Files to create:**
- `components/chat/ChatScreen.tsx` - Main chat container
- `components/chat/MessageList.tsx` - Scrollable message list
- `components/chat/MessageBubble.tsx` - Individual message component
- `components/chat/ChatInput.tsx` - Message input with send button
- `components/chat/AIThinkingIndicator.tsx` - Loading indicator for AI response
- `components/chat/QuickActions.tsx` - Quick action buttons (optional)

**ChatScreen Component:**
- Container with message list and input
- Handle keyboard appearance
- Auto-scroll to bottom on new messages
- Pull-to-refresh for history

**MessageList:**
- FlatList or ScrollView with messages
- Group messages by date (optional)
- Show timestamps
- Smooth scrolling

**MessageBubble:**
- Different styling for user vs assistant messages
- User: Right-aligned, primary color
- Assistant: Left-aligned, secondary color
- Show message content
- Show timestamp
- Show context links if message relates to specific step

**ChatInput:**
- Text input field
- Send button (disabled when empty)
- Character limit indicator (optional)
- Placeholder text: "Ask about your care journey..."

**AIThinkingIndicator:**
- Animated dots or spinner
- Show "AI is thinking..." message
- Display while waiting for OpenAI response

### 5. AI Response Generation
**File to create:**
- `lib/aiService.ts` - Core AI service functions

**Main Function:**
- `generateAIResponse(userMessage, patientId, roadmapId?)` - Generate AI response
  - Load patient's roadmap context if available
  - Build context string
  - Call OpenAI API with system prompt + context + user message
  - Parse and return response
  - Save both user message and AI response to database
  - Handle errors and retries

**Response Processing:**
- Extract any step references from AI response
- Link response to relevant roadmap/step if applicable
- Format response text appropriately
- Handle markdown if OpenAI returns formatted text

### 6. Context-Aware Responses
**Context Integration:**
- When user asks about a step, include that step's details in context
- When user asks general questions, include active roadmap overview
- Include upcoming steps, overdue items, completed items in context
- Provide step-specific information (prep instructions, provider info, dates)

**Example Context Strings:**
- "Patient has an active Cardiology Referral Journey roadmap with 5 steps. Step 1 (Blood Test) is completed. Step 2 (Cardiologist Appointment) is scheduled for [date]. Step 3 (Follow-up) is pending..."

### 7. Proactive Alerts and Suggestions
**File to create:**
- `lib/alertService.ts` - Alert generation logic
- `components/chat/AlertBanner.tsx` - Alert display component

**Alert Types:**
- Upcoming appointments (24-48 hours before)
- Overdue steps
- Prep instructions reminders (before tests/appointments)
- Medication reminders (if added in future)
- Follow-up care suggestions

**Alert Generation:**
- `generateProactiveAlerts(patientId)` - Check roadmap for alert conditions
- Use AI to generate friendly alert messages
- Display alerts at top of chat or as banner
- Allow dismissing alerts

**Alert Display:**
- Show alert banner above chat input
- Color-coded by urgency (red for overdue, yellow for upcoming)
- Action buttons (e.g., "View Step Details", "Dismiss")

### 8. Quick Actions and Suggestions
**File to create:**
- `components/chat/QuickSuggestions.tsx` - Suggested questions/actions

**Quick Suggestions:**
- "What's my next step?"
- "Do I need to fast for my blood test?"
- "When is my next appointment?"
- "What should I bring to my appointment?"
- Show as chips/buttons above input
- Tap to send as message

**Smart Suggestions:**
- Based on current roadmap state
- Show relevant questions based on upcoming steps
- Update dynamically as roadmap progresses

### 9. Chat History Management
**History Features:**
- Load last N messages on screen open
- Load more on scroll up (pagination)
- Search history (optional, future enhancement)
- Clear history option (optional)

**Performance:**
- Lazy load older messages
- Cache recent messages
- Optimize database queries

### 10. Error Handling and Fallbacks
**Error Scenarios:**
- OpenAI API failure → Show friendly error, suggest retry
- Network issues → Queue message, retry when online
- Rate limiting → Show message, suggest waiting
- Invalid API key → Clear error message

**Fallback Responses:**
- If AI fails, show helpful default responses
- Direct users to contact provider for urgent questions
- Provide general guidance based on step type

### 11. Main Chat Screen
**File to modify:**
- `app/(tabs)/chat.tsx` - Main chat tab screen

**Screen Features:**
- Chat interface
- Alert banners (if any)
- Quick suggestions
- Empty state (first time user)
- Welcome message from AI

**Welcome Message:**
- On first chat open, show AI welcome message
- Introduce chatbot capabilities
- Suggest first questions to ask

### 12. Message Formatting and Rich Content
**Message Content:**
- Support basic markdown (bold, italic, lists)
- Format step references as clickable links
- Format dates nicely
- Format phone numbers as clickable links

**Rich Features (Optional):**
- Show step cards inline in chat
- Show roadmap preview in chat
- Embed images/documents (future)

### 13. Security and Privacy
**Privacy Considerations:**
- Don't send full medical records to AI
- Only send relevant roadmap context
- Sanitize user inputs
- Log interactions for debugging (optional, with consent)

**API Security:**
- Store OpenAI API key securely
- Consider using Supabase Edge Function as proxy (more secure)
- Rate limit API calls
- Validate inputs before sending to AI

### 14. Alternative: Supabase Edge Function Proxy (Optional Enhancement)
**If direct OpenAI calls are not preferred:**
- Create Supabase Edge Function as proxy
- Store API key server-side
- Call Edge Function from app
- More secure, but requires Supabase Pro plan

**File to create (if using):**
- `supabase/functions/chat-ai/index.ts` - Edge function for AI calls

## Component Structure
```
components/chat/
├── ChatScreen.tsx           # Main container
├── MessageList.tsx          # Message list
├── MessageBubble.tsx        # Individual message
├── ChatInput.tsx           # Input field
├── AIThinkingIndicator.tsx # Loading state
├── AlertBanner.tsx         # Proactive alerts
└── QuickSuggestions.tsx    # Suggested questions
```

## AI Response Examples
**User:** "Do I need to fast for my blood test?"
**AI:** "Yes, according to your care roadmap, you need to fast for 12 hours before your blood test scheduled for [date]. This means no food or drinks (except water) after [time]."

**User:** "What's my next step?"
**AI:** "Your next step is your Cardiologist Appointment scheduled for [date] at [time]. Make sure to bring your insurance card and a list of current medications. The appointment is with Dr. [Name] at [Location]."

**User:** "When was my referral received?"
**AI:** "Your Cardiology Referral was received on [date] and is marked as completed. You're currently on Step 2 of 5 in your care journey."

## Dependencies
```bash
npm install openai
```

## Environment Variables Needed
- `OPENAI_API_KEY` - User's OpenAI API key

## Testing Checklist
- [ ] Chat interface displays correctly
- [ ] User can send messages
- [ ] AI responds with relevant answers
- [ ] Context from roadmap is included in responses
- [ ] Chat history loads and displays
- [ ] Messages are saved to database
- [ ] Real-time updates work
- [ ] Proactive alerts display correctly
- [ ] Quick suggestions work
- [ ] Error handling works (API failures, network issues)
- [ ] Phone numbers in messages are clickable
- [ ] Step references are clickable (if implemented)
- [ ] Welcome message shows on first use
- [ ] Empty state displays correctly
- [ ] Dark mode styling works

## Future Enhancements (Not in Scope)
- Voice input/output
- Image analysis (e.g., test results)
- Multi-language support
- Integration with provider systems
- Medication tracking and reminders
- Appointment scheduling through chat

## Next Steps
After completing all three plans, the core features will be complete. Consider:
- User testing and feedback
- Performance optimization
- Additional features based on user needs
- Enhanced AI capabilities
- Integration with external healthcare systems

