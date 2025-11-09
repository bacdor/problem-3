# Plan 02: Personalized Care Roadmap

## Overview

Build the visual timeline/roadmap interface that displays care journey steps with color-coded progress indicators and interactive step details.

## Objectives

- Create visual timeline component showing care journey steps
- Implement color-coded status indicators (green=done, yellow=upcoming, red=overdue)
- Build interactive step detail views
- Add step completion tracking
- Display prep instructions and provider contact info
- Implement smooth animations and transitions

## Implementation Steps

### 1. Roadmap Data Layer

**Files to create:**

- `lib/roadmap.ts` - Roadmap data fetching and mutation functions
- `hooks/useRoadmap.ts` - React hook for roadmap data
- `hooks/useCareSteps.ts` - React hook for care steps

**Functions needed:**

- `getRoadmaps(patientId)` - Fetch all roadmaps for patient
- `getRoadmap(roadmapId)` - Fetch single roadmap with steps
- `getCareSteps(roadmapId)` - Fetch steps for a roadmap
- `updateStepStatus(stepId, status)` - Update step status
- `markStepComplete(stepId)` - Mark step as completed
- `subscribeToRoadmapUpdates(roadmapId, callback)` - Real-time updates

**Real-time Features:**

- Subscribe to care_steps table changes
- Auto-update UI when step status changes
- Handle optimistic updates for better UX

### 2. Roadmap UI Components

**Files to create:**

- `components/roadmap/RoadmapTimeline.tsx` - Main timeline component
- `components/roadmap/RoadmapStep.tsx` - Individual step component
- `components/roadmap/StepStatusIndicator.tsx` - Status badge/indicator
- `components/roadmap/StepDetailModal.tsx` - Step detail modal/sheet
- `components/roadmap/RoadmapHeader.tsx` - Roadmap title and metadata

**RoadmapTimeline Component:**

- Vertical timeline layout with connecting lines
- Render steps in chronological order (by scheduled_date or order)
- Show progress percentage at top
- Scrollable list of steps
- Pull-to-refresh support

**RoadmapStep Component:**

- Step card with icon based on step_type
- Status indicator (colored dot/badge)
- Step title and scheduled date
- Quick action buttons (mark complete, view details)
- Tap to open detail modal
- Visual distinction for overdue items

**StepStatusIndicator:**

- Color-coded badges:
  - Green (#10B981) for "completed"
  - Yellow (#F59E0B) for "in_progress" or "pending" (upcoming)
  - Red (#EF4444) for "overdue"
  - Gray (#6B7280) for cancelled
- Icon indicators (checkmark, clock, alert, etc.)

**StepDetailModal:**

- Full step information display
- Prep instructions section
- Provider contact info with call button
- Date/time information
- Mark complete button
- Close button

### 3. Step Type Icons and Styling

**File to create:**

- `lib/stepTypes.ts` - Step type configuration

**Step Type Configurations:**

- `referral_received`: Icon, label, default color
- `appointment_scheduled`: Icon, label, default color
- `tests_labs`: Icon, label, default color
- `specialist_consultation`: Icon, label, default color
- `follow_up_care`: Icon, label, default color

**Icons to use:**

- Use `@expo/vector-icons` or `expo-symbols` for icons
- Map each step_type to appropriate icon

### 4. Status Calculation Logic

**File to create:**

- `lib/stepStatus.ts` - Status calculation utilities

**Status Logic:**

- `isOverdue(step)` - Check if step is past due_date and not completed
- `getStepStatusColor(status, step)` - Return color based on status and dates
- `calculateProgress(steps)` - Calculate completion percentage
- `getNextUpcomingStep(steps)` - Find next step that needs attention

**Overdue Detection:**

- Compare `due_date` with current date
- Consider time of day if needed
- Mark as overdue if past due and status is not "completed"

### 5. Main Roadmap Screen

**File to modify:**

- `app/(tabs)/roadmap.tsx` - Main roadmap screen implementation

**Screen Features:**

- Display active roadmap(s) for logged-in patient
- If multiple roadmaps, show tabs or list
- If single roadmap, show full timeline
- Empty state if no roadmaps exist
- Loading state while fetching data
- Error state with retry option

**Layout:**

- Header with roadmap title
- Progress indicator (X% complete)
- Timeline component
- Floating action button (if needed for future features)

### 6. Interactive Features

**Step Interaction:**

- Tap step card → Open detail modal
- Swipe actions (optional) → Quick mark complete
- Long press → Additional options menu
- Call provider button → Use `expo-linking` to open phone dialer

**Detail Modal Features:**

- Scrollable content
- Prep instructions formatted nicely
- Provider info with clickable phone number
- Date/time display with calendar icon
- Mark complete button with confirmation
- Close gesture (swipe down or tap outside)

### 7. Animations and Transitions

**Animations to add:**

- Step card entrance animations (staggered)
- Status change animations (smooth color transitions)
- Modal open/close animations
- Progress bar fill animation
- Completion checkmark animation

**Libraries:**

- Use `react-native-reanimated` (already installed)
- Use `expo-haptics` for tactile feedback on interactions

### 8. Empty and Loading States

**Empty State:**

- Friendly message: "No care roadmap yet"
- Illustration or icon
- Information about what roadmaps are

**Loading State:**

- Skeleton loaders for step cards
- Shimmer effect
- Progress indicator

**Error State:**

- Error message
- Retry button
- Support contact info

### 9. Date Formatting and Localization

**File to create:**

- `lib/dateUtils.ts` - Date formatting utilities

**Functions:**

- `formatStepDate(date)` - Format date for step display
- `formatRelativeDate(date)` - "Today", "Tomorrow", "In 3 days"
- `isToday(date)` - Check if date is today
- `isPastDue(date)` - Check if date is in the past

### 10. Enhanced Seeding Data

**Update seed data:**

- Add more diverse step examples
- Include steps with different statuses
- Add realistic dates (some past, some future)
- Include prep instructions examples
- Add provider contact information

## Component Structure

```
components/roadmap/
├── RoadmapTimeline.tsx      # Main container
├── RoadmapStep.tsx          # Individual step card
├── StepStatusIndicator.tsx  # Status badge
├── StepDetailModal.tsx      # Detail view
├── RoadmapHeader.tsx        # Header with progress
└── EmptyState.tsx           # Empty state component
```

## Styling Considerations

- Use theme colors from `constants/theme.ts`
- Ensure dark mode support
- Use consistent spacing (8px grid)
- Accessible color contrast ratios
- Touch targets at least 44x44 points

## Dependencies

- `react-native-reanimated` - Already installed
- `expo-haptics` - Already installed
- `expo-linking` - Already installed (for phone calls)

## Testing Checklist

- [ ] Roadmap displays all steps correctly
- [ ] Steps are sorted chronologically
- [ ] Status colors are correct (green/yellow/red)
- [ ] Overdue detection works correctly
- [ ] Step detail modal opens on tap
- [ ] Provider phone number opens dialer
- [ ] Mark complete updates status
- [ ] Real-time updates work
- [ ] Progress percentage calculates correctly
- [ ] Empty state displays when no data
- [ ] Loading states work properly
- [ ] Animations are smooth
- [ ] Dark mode styling works

## Next Steps

After completing this plan, proceed to **PLAN-03-AI-GUIDANCE.md** to implement the AI-Driven Guidance chatbot feature.
