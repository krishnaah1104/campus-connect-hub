# Campus Connect Hub

# CampusConnect — Complete Lovable AI Build Prompt
*(Merged from: UI/UX Design Spec + Product Feature Spec)*

## 1. PROJECT OVERVIEW & CORE VISION

ScaleX is a mobile-first campus coordination platform and verified digital identity layer for college students.

It is designed as a mobile-first PWA using:
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **Supabase-ready architecture**

### Core Philosophy
> *"I need to do something or find someone. Who else in my college matches?"*

Instead of generic social media noise, CampusConnect organizes the entire campus by verified student attributes:
- **Hostel** (Uniworld 1, Uniworld 2)
- **Batch** (2030, 2029, 2028, 2027)
- **Degree** (IITM, BITS)
- **Course / Specialization** (CAI, AIB)
- **Skills** (Python, React, DSA, Machine Learning, Figma, Node.js, Solidity, Go, C++)
- **Clubs** (AI/ML Club, Web Dev Club, Robotics, Finance, Design, Sports, Music, Open Source)
- **Leadership Titles** (Club President, Vice President, Core Team Member, Tech Lead)
- **Achievements** (GSoC, LFX, ICPC Regionalist, Hackathon Winner, SIH Winner)
- **Home State / Region** (Karnataka, UP, Rajasthan, Maharashtra, Delhi, etc.)
- **Life Status** (Internship, DSA prep, Side projects, Chilling, Hometown)
- **Academic Information** (CGPA, SGPA, Domain)

The product should feel like a combination of:
- A **private college directory**
- **Discord-style** campus coordination
- **LinkedIn-style** student profiles
- A modern **campus utility platform**

*Do not make it look like a generic social media app.*  
The interface should feel: **Premium + youthful + technical + trustworthy + campus-native + highly organized.**

---

## 2. PRIMARY DESIGN OBJECTIVE

Build the complete UI/UX prototype of CampusConnect.

For this stage:

### PRIORITIZE:
- Visual design & aesthetics
- Responsive layouts (Mobile-first & Desktop)
- Navigation & transitions
- Micro-interactions & component states (Hover, Active, Focus)
- Modals, Bottom Sheets & Drawers
- Instant multi-attribute search & filters
- Deep profile editing & CGPA privacy toggle
- Interactive chat & group channel previews
- Live activity previews & participation
- Realistic mock data across all batches, clubs, hostels, and states
- Empty states, Loading states (Skeletons), Error states & Toast notifications

### DO NOT PRIORITIZE:
- Real authentication / Google OAuth credentials
- Real Supabase database connection
- Real-time backend server infrastructure
- Production notification webhooks
- Actual messaging backend

> *Use realistic mock data and local frontend state wherever backend functionality would normally be required. The architecture should nevertheless be clean and Supabase-ready so backend integration can happen seamlessly later.*

---

## 3. VISUAL DESIGN DIRECTION

Create a polished, modern, premium student-tech aesthetic.

### Overall Style:
- **Glassmorphism:** Subtle, translucent layered surfaces (`backdrop-blur-md / bg-slate-900/60`).
- **Borders:** Thin, soft borders with subtle white/blue-gray transparency (`border-white/10` or `border-slate-800`).
- **Cards:** Rounded cards (`rounded-2xl` / `rounded-xl`) with layered depth.
- **Typography:** Clean, legible sans-serif fonts with modern letter-spacing.
- **Shadows:** Minimal, soft glowing shadows on interactive focus.
- **Gradients:** Subtle dark mesh gradients, gentle glowing accents.
- **Icons:** Consistent Lucide React icons.
- **Micro-interactions:** Snappy 150–250ms transitions.

### Avoid:
- Excessive or muddy glass effects.
- Overly bright/rainbow gradients.
- Generic, soulless enterprise SaaS dashboards.
- Massive oversized fonts that waste mobile real estate.
- Cluttered, overwhelming cards.

*The application should feel like a state-of-the-art product crafted by a top-tier student startup team.*

---

## 4. COLOR SYSTEM

Use a dark-first visual system tailored for modern screens.

### Background & Surfaces:
- **Primary Background:** `#080B12` (Deep Obsidian / Dark Navy)
- **Secondary Background:** `#0D111A` (Charcoal Slate)
- **Card Surface:** `#111722` (Dark Blue-Gray)
- **Elevated Surface / Popover:** `#151C28`
- **Borders:** Subtle white/blue-gray transparency (`rgba(255, 255, 255, 0.08)`)

### Accent Palette:
- **Primary Accent (Electric Blue / Cyan):** `#00D2FF` / `#3B82F6` — Used for active navigation, selected filter chips, CTA buttons, verified badges, focus rings, and links.
- **Secondary Accent (VCream/beige) — Used sparingly for achievement badges, special highlights, and AI-related features.

### Semantic Status Colors:
- **Emerald Green (`#10B981`):** Online presence, active status, bus available, verified badge, success toasts.
- **Amber / Gold (`#F59E0B`):** Achievements (GSoC, ICPC), leadership roles, star highlights.
- **Coral Red (`#EF4444`):** Error alerts, destructive actions, cancel buttons.

---

## 5. TYPOGRAPHY

- **Font Family:** Inter, Geist, or Manrope with modern styling.
- **Large Heading:** Bold (`font-bold` / `font-extrabold`), clean, tight letter spacing (`tracking-tight`).
- **Section Heading:** Medium to Semi-bold (`text-lg font-semibold`).
- **Body Text:** Clear, readable, slightly muted for comfort (`text-sm text-slate-300`).
- **Metadata / Subtitles:** Smaller, muted text (`text-xs text-slate-400`).
- **Tag / Badge Text:** Compact, semibold uppercase/title text (`text-xs font-medium tracking-wide`).

---

## 6. RESPONSIVE DESIGN

The product is **strictly mobile-first**, engineered primarily for modern mobile viewports (360px, 390px, 412px, 430px) and scaling seamlessly to tablet and desktop (1200–1400px max width container).

### Mobile UX (360px – 768px):
- Sticky glassmorphic top header.
- Sleek sticky 4-tab bottom navigation.
- Full-width rounded cards with optimized touch targets (min 44px).
- Bottom sheets & slide-up drawers for filters and deep profiles.
- Horizontal scrollable filter chips with snap scrolling.

### Desktop Experience (1024px+):
- Centered application shell (max-width `1280px` or `1400px`).
- Left-hand collapsible / expanded sidebar navigation.
- Multi-column grid for student exploration cards (2–3 columns).
- Split-pane layout for direct messaging and group chat channels.
- Right-side slide-over drawer or centered modal for full student dossiers.

---

## 7. PHASED DEVELOPMENT ROADMAP

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: IMMEDIATE MVP (Build & Polish First)                                          │
│ 1. Frictionless Onboarding (Zero Typing UX + College Google Auth)                      │
│ 2. People Discovery / Campus Directory (Explore Tab + Multi-Filter Suite)             │
│ 3. Deep Profile System (Edit All Attributes: State, CGPA, Titles, GSoC/ICPC Badges)   │
│ 4. Navigation Shell (Top Bar with Sidebar, Notifications, Profile + 4-Tab Bottom Bar) │
│ 5. Realtime Chat & Auto-Enrolled Group Channels (Supabase Realtime)                    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: EXTENDED ECOSYSTEM (Next Milestones)                                          │
│ 6. Academic & Assignment Doubt Matching (#DSA, #Python, Topics)                       │
│ 7. Campus ↔️ Hostel Ride Pooling (Uniworld ↔️ SST Campus)                               │
│ 8. Student Initiatives & Activity Coordination (Cricket, Hackathon Teams, Gym)        │
│ 9. Moderated Anonymous Student Community Space                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

*For the current prototype, implement the entire Phase 1 UI completely, with Phase 2 presented through polished, high-fidelity preview/staged interfaces.*

---

## 8. SCREEN HIERARCHY & NAVIGATION ARCHITECTURE

```
[Screen 1: Welcome & Auth]
        │
        ▼ (Google OAuth Login)
[Screen 2: Quick Profile Setup (15-Sec Zero Typing)]
        │
        ▼ (Complete Setup)
[Screen 3: Main Application Shell]
        ├── TOP BAR: Hamburger Menu | CampusConnect Logo | Notification Bell | Profile Avatar
        ├── SIDEBAR DRAWER: Explore | DMs | Groups | Activities | Rides | Doubts | Profile
        ├── BOTTOM BAR:
        │     ├── 1. Explore (Campus Directory Flagship MVP)
        │     ├── 2. Chat (1-on-1 Direct Messages)
        │     ├── 3. Group Chat (Auto-Enrolled Hostel, Batch, Club Channels)
        │     └── 4. Activities (Rides, Doubts, Hackathons, Sports Previews)
        └── DRAWERS / MODALS:
              ├── Deep Profile Dossier & Self Profile Editor
              ├── Advanced Multi-Filter Bottom Sheet
              └── Notification Center Popover
```

---

## 9. SCREEN 1 — WELCOME & AUTHENTICATION

Create a stunning splash / onboarding hero screen.
EXACTLY AS IN IMAGE OF FIRDT IMAGE PROVIDED.
### Layout:
- **Desktop:** Centered glowing card or split-screen visual composition.
- **Mobile:** Clean, vertically centered single-column composition with glowing background ambient blurs.

### Elements:
1. **Brand Icon & Logo:** CampusConnect shield/network icon with cyan glow.
2. **Hero Heading:** *"Welcome to CampusConnect"*
3. **Tagline:** *"One digital layer for your entire college."*
4. **Description:** *"Connect with batchmates, find project peers, discover clubs, and coordinate campus life."*
5. **Primary CTA Button:** `[ Continue with Google ]` with official Google 'G' icon, hover glow, and scale animation.
6. **Trust & Domain Indicator:**
   - Badge: `✓ Verified SST Students • College-Only Access`
   - Helper notice: `Only @sst.scaler.com accounts are allowed.`

---

## 10. SCREEN 2 — QUICK PROFILE SETUP

**Target: 15 seconds to complete.** Eliminate typing friction. Use progressive disclosure, tap pills, and animated conditional fields.

### Profile Header:
- Auto-populated Google profile photo / avatar placeholder.
- Full Name (e.g., `Krishna Yaswal`).
- Email indicator with verified shield (e.g., `krishna@sst.scaler.com`).

NAME FIRST
## 11. YEAR / BATCH

- **Heading:** *"What's your graduating batch?"*
- **Horizontal Radio Button Pills:**
  - `[ 2030 ]` &nbsp;&nbsp; `[ 2029 ]` &nbsp;&nbsp; `[ 2028 ]` &nbsp;&nbsp; `[ 2027 ]`
- **Active State:** Cyan accent background, luminous border, subtle glow, checkmark icon.

---

## 12. COURSE / SPECIALIZATION (Conditional)

- **Conditional Logic:** ONLY appears when **`2030`** is selected. Smoothly collapses/hides for 2029, 2028, 2027.
- **Options (Radio Pills):**
  - `[ CS + AI ]` &nbsp;&nbsp; `[ AI + Bio ]`

---

## 13. DEGREE (Conditional Rules)

- **Options:** `[ IITM ]` &nbsp;&nbsp; `[ BITS ]`
- **Rules:**
  - If **2030** or **2029** selected: Student can freely toggle between `IITM` and `BITS`.
  - If **2028** or **2027** selected: Automatically locked to `BITS` with a lock icon and helper text: *"Degree is automatically assigned for this batch."*

---

## 14. HOSTEL / LIVING LOCATION

- **Heading:** *"Where do you stay?"*
- **Radio Card Options:**
  - `[ 🏢 Uniworld 1 ]` &nbsp;&nbsp; `[ 🏢 Uniworld 2 ]` &nbsp;&nbsp; `[ 🚗 Day Scholar ]`

---


---

## 16. HOME STATE / REGION (Searchable Dropdown)

- **Mandatory Field.**
- Searchable select component with all Indian States & Union Territories (Karnataka, Maharashtra, Uttar Pradesh, Rajasthan, Delhi, Telangana, Tamil Nadu, West Bengal, Bihar, Haryana, Kerala, Gujarat, etc.).
- Features: Live search filter, keyboard navigation, clear button, tag indicator.

---

## 17. LIFE STATUS (Slack/Discord Style)

- **Heading:** *"What are you up to right now?"*
- **1-Tap Quick Presets:**
  - 💼 *Doing internship right now*
  - 💻 *Preparing for DSA & interviews*
  - 🏡 *At home in my hometown*
  - 🎮 *Chilling after exams*
  - 🚀 *Building side projects*
- **Custom Status Option:** Inline input field with emoji picker and 80-character counter.

---

---

## 19. ONBOARDING COMPLETION

- **Progress Meter:** e.g., `Profile 90% Complete • Almost ready!`
- **Primary CTA:** `[ Enter Campus → ]` (Triggers celebratory micro-confetti or smooth slide transition into the Explore Directory).

---

## 20. MAIN APPLICATION SHELL

### Top Navigation Header (Persistent):
- **Left:** Hamburger Menu icon (`Menu` from Lucide) to toggle the slide-over sidebar.
- **Center / Left-Center:** CampusConnect Logo + Text (`CampusConnect`), with smaller college subtitle (`Swarrnim Startup & Innovation University` / `SST`).
- **Right:**
  - Notification Bell icon with active unread badge pill (`3`).
  - Student Profile Avatar button with online status indicator.

---

## 21. NOTIFICATION CENTER

- **Trigger:** Bell icon in top header.
- **Panel:** Floating popover on desktop / slide-down drawer on mobile.
- **Mock Notifications:**
  - 💬 *"Rahul Sharma sent you a direct message"* • `2m ago`
  - 🤖 *"New member joined AI/ML Club channel"* • `1h ago`
  - 👀 *"Your profile was viewed by 14 batchmates"* • `3h ago`
  - 🏆 *"Hackathon team activity updated in #hackathons"* • `1d ago`
- **Controls:** `[Mark all as read]`, filter by unread, clear all.

---

## 22. PROFILE BUTTON & DRAWER TRIGGER

- Clicking the top-right avatar triggers the **Deep Profile Drawer / Modal**.
- Allows instant switching between **"View Public Dossier"** and **"Edit Profile"**.

---

## 23. SIDEBAR NAVIGATION (Slide-Out)

- **Slide-out animation:** Smooth `translateX` transition with dark blurred backdrop.
- **Sections & Links:**
  - **MAIN:**
    - 🧭 Explore Directory
    - 💬 Direct Messages
    - 👥 Group Channels
    - ⚡ Campus Activities
  - **CAMPUS TOOLS (Phase 2 Previews):**
    - 🚗 Ride Pool (Uniworld ↔ SST)
    - 💡 Doubt Matching (#DSA, #Python)
    - 🛡️ Anonymous Student Space
  - **ACCOUNT:**
    - 👤 My Profile
    - 🔖 Saved Profiles
    - ⚙️ Preferences & Privacy
- **Bottom Footer:**
  - `✓ Verified SST Student` badge
  - `[ Sign Out ]` button

---

## 24. BOTTOM NAVIGATION BAR

Sticky, glassmorphic floating bar at the bottom with 4 primary navigation destinations:
1. **🧭 Explore** (`Compass` icon) — *Campus Directory Flagship MVP*
2. **💬 Chat** (`MessageCircle` icon) — *1-on-1 Direct Conversations (with unread badge)*
3. **👥 Groups** (`UsersRound` / `MessagesSquare` icon) — *Auto-Enrolled Hostel/Batch/Club Channels*
4. **⚡ Activities** (`Zap` / `Calendar` icon) — *Rides, Doubts, Sports, Hackathons*

*Active tab displays glowing cyan accent icon, filled background pill, and smooth micro-spring transition.*

---

## 25. EXPLORE — FLAGSHIP MVP SCREEN

*The central hub of CampusConnect. Browse, filter, and discover every student on campus with zero latency.*

- **Header Section:**
  - Title: **"Explore Campus"**
  - Subtitle: *"Find the right people for whatever you're doing."*
  - **Live Campus Counter Stats:** `1,248 Students` • `37 Clubs` • `82 Skills` • `14 Active Rides`

---

## 26. SEARCH BAR & INSTANT SEARCH UX

- **Large Search Bar:**
  - Placeholder: *"Search students, skills, clubs, achievements, hostel, state..."*
  - Desktop keyboard shortcut badge: `⌘ K` / `Ctrl + K`.
  - Leading search icon, instant clear (`✕`) button.
- **Instant Frontend Search:** Real-time filtering across Student Name, Skills, Clubs, Leadership Titles, State, Achievements, and Bio.
- **Result Counter:** e.g., *"Showing 24 matching students"* with instant reset link.

---

## 27. HORIZONTAL FILTER BAR

Quick-tap scrollable pills above the student grid:
- `[ All ]`
- `[ 🏢 Hostel ▾ ]`
- `[ 🎓 Batch ▾ ]`
- `[ 📜 Degree ▾ ]`
- `[ 📍 State ▾ ]`
- `[ 👥 Clubs ▾ ]`
- `[ ⚡ Skills ▾ ]`
- `[ 🏆 Achievements ▾ ]`
- `[ 👑 Roles ▾ ]`
- `[ 💼 Life Status ▾ ]`

*Tapping any filter pill opens the detailed Filter Popover or full Filter Modal.*

---

## 28. ADVANCED MULTI-FILTER MODAL / BOTTOM SHEET

Full multi-criteria filter suite:
- **Hostel:** `All`, `Uniworld 1`, `Uniworld 2`, `Day Scholar`
- **Batch:** `All`, `2030`, `2029`, `2028`, `2027`
- **Degree / Course:** `IITM`, `BITS`, `CS + AI`, `AI + Bio`
- **Home State:** Searchable multi-select list.
- **Clubs:** `AI/ML`, `Web Dev`, `Robotics`, `Finance`, `Design`, `Sports`, `Music`, `Open Source`
- **Skills:** `DSA`, `Python`, `React`, `Machine Learning`, `Node.js`, `Figma`, `Solidity`, `C++`, `Go`
- **Achievements:** `GSoC`, `LFX`, `ICPC Regionalist`, `Hackathon Winner`, `SIH Winner`, `Open Source Contributor`
- **Leadership Titles:** `Club President`, `Vice President`, `Core Member`, `Tech Lead`, `Organizer`
- **Life Status:** `Doing internship`, `DSA Prep`, `Building projects`, `At home`
- **Footer Actions:** `[ Reset All ]` and `[ Show X Matching Students ]`
    WE WILL USE SUPABASE PROJECT FOR DATABASE, DO NOT CREATE LOVABLE CLOUD, USE ABOVE IMAGE AS THE FIRST PAGE, AND USE SAME DESIGN AESTHETICS FOR REST OF ALL PAGES, USE SUPABASE FOR GOOGLE OAUTH , AND BILD IT UP AND CREATE LOVABLE PROJECT TOO WITH EVERYTHING ALL ALIGNED. AS WE HAVE DB WE WILL NOT HAVE ANY MOCK DATA, RIGHT BUILD FIRST THREEE SCREENS WORKING WITH SUPABASE BACKEND

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9cc49664-5169-4a5b-9618-9e65f9883e79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
