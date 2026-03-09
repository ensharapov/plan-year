# Навигатор Состояний — Project Documentation

## Architecture

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **UI:** shadcn/ui + Lucide Icons + Framer Motion
- **Backend:** Lovable Cloud (Supabase under the hood)
- **Auth:** Email/password + Magic Link
- **Design:** Dark mode by default, Cormorant Garamond (headings) + Inter (body), glassmorphism

## Database Schema

### Enums
- `app_role`: admin, moderator, user
- `subscription_status`: free, trial, active, cancelled, expired
- `session_status`: in_progress, completed

### Tables
| Table | Purpose |
|-------|---------|
| `user_roles` | Role-based access (admin/moderator/user) |
| `profiles` | User profile, subscription status, onboarding flag |
| `yearly_sessions` | Yearly planning session tracking (wizard progress) |
| `negative_states` | "What I DON'T want" entries + reframed content |
| `point_a` | Current reality description + energy level |
| `destinations` | "Address in Navigator" — inspiring goals |
| `headlights` | Daily actions ("What resonates today?") |
| `state_transforms` | Negative→Positive reframing records |
| `buddy_interactions` | Energy sharing between partners |
| `streaks` | Energy streaks and engagement tracking |

### Security
- All tables have RLS enabled
- Users can only access their own data
- Roles stored in separate `user_roles` table (never on profiles)
- `has_role()` security definer function prevents recursive RLS
- Auto-trigger creates profile + role + streak on signup

## Implemented Features (Phase 1)
- [x] Lovable Cloud enabled with full schema
- [x] Premium dark theme with custom color tokens
- [x] Cormorant Garamond + Inter typography
- [x] Glassmorphism utility classes
- [x] Email/password & magic link authentication
- [x] Protected routes
- [x] Landing page with animated hero

## Phases Remaining
- [x] Phase 2: Yearly Session onboarding wizard (5 steps + summary)
- [x] Phase 2.5: Desire Discovery Engine (Tinder-like swipe for goals, 26 mock cards, 4 tiers)
- [x] Phase 3: Main Dashboard (Headlights) — daily focus, destination display, streak stats, celebration animation
- [x] Phase 4: State Transformer — monster input → visual transformation → reframe → energy tracking + history
- [x] Phase 5: Gamification — Buddy pairing (invite codes), headlight visibility, "Кайфануть" button with emoji explosion animation, streaks
- [ ] Phase 6: Paywall & Monetization UI
