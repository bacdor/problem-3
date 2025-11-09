# Healthcare Care Navigation App - Planning Overview

## Project Summary

Building a patient-facing mobile healthcare app using Expo and Supabase to provide personalized care roadmaps and AI-driven guidance for referrals and care navigation.

## Planning Files Structure

### 📋 PLAN-01-FOUNDATION.md

**Focus:** Infrastructure and Authentication

- Supabase setup and configuration
- Email/password authentication
- Database schema design (profiles, care_roadmaps, care_steps, chat_messages)
- Navigation structure
- Type definitions
- Initial data seeding

**Estimated Complexity:** Medium
**Dependencies:** None (foundational)

### 🗺️ PLAN-02-ROADMAP.md

**Focus:** Personalized Care Roadmap Feature

- Visual timeline component
- Color-coded status indicators
- Interactive step details
- Step completion tracking
- Real-time updates
- Animations and transitions

**Estimated Complexity:** High
**Dependencies:** Requires PLAN-01 completion

### 🤖 PLAN-03-AI-GUIDANCE.md

**Focus:** AI-Driven Guidance Chatbot

- OpenAI integration
- Chat interface
- Context-aware responses
- Proactive alerts
- Chat history management

**Estimated Complexity:** High
**Dependencies:** Requires PLAN-01 completion, PLAN-02 recommended for full context

## Implementation Order

1. **Start with PLAN-01** - Foundation must be complete before other features
2. **Then PLAN-02** - Roadmap can be built independently
3. **Finally PLAN-03** - AI Guidance benefits from roadmap context but can start with basic chat

## Key Technical Decisions

- **Backend:** Supabase (PostgreSQL database + Auth + Real-time)
- **AI Provider:** OpenAI (GPT-4/GPT-3.5)
- **Authentication:** Supabase Auth (email/password)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context + Hooks
- **Animations:** react-native-reanimated
- **Styling:** React Native StyleSheet with theme support

## Environment Variables Required

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key  # Needed for Plan 03
```

## Database Schema Overview

1. **profiles** - User profile information
2. **care_roadmaps** - Patient care journey roadmaps
3. **care_steps** - Individual steps in a roadmap (referrals, appointments, tests, etc.)
4. **chat_messages** - AI chat conversation history

## Next Steps

1. Review all three planning files
2. Set up Supabase project and configure environment variables
3. Begin implementation with PLAN-01-FOUNDATION.md
4. Test each plan before moving to the next

## Notes

- Each plan is designed to be implemented independently
- Plans include detailed file structures, component breakdowns, and testing checklists
- Seed data is included for testing without external integrations
- Real-time features use Supabase subscriptions
- All plans include dark mode support considerations
