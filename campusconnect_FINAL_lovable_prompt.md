# CampusConnect — Complete Lovable AI Build Prompt
*(Merged from: UI/UX Design Spec + Product Feature Spec)*

## 1. PROJECT OVERVIEW & CORE VISION

CampusConnect is a mobile-first campus coordination platform and verified digital identity layer for college students.

It is designed as a mobile-first PWA using:
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **Supabase-ready architecture**

### Core Philosophy
> *"I need to do something or find someone. Who else in my college matches?"*

Instead of generic social media noise, CampusConnect organizes the entire campus by verified student attributes:
- **Hostel** (Uniworld 1, Uniworld 2, Day Scholar)
- **Batch** (2030, 2029, 2028, 2027)
- **Degree** (IITM, BITS)
- **Course / Specialization** (CS + AI, AI + Bio)
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
- **Secondary Accent (Violet / Purple):** `#8B5CF6` / `#A855F7` — Used sparingly for achievement badges, special highlights, and AI-related features.

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

---

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

## 15. BUS FACILITY

- **Heading:** *"Do you use the campus bus facility?"*
- **Segmented Toggle:**
  - `[ 🚌 Yes ]` &nbsp;&nbsp; `[ No ]`

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

## 18. CLUBS & SKILLS (Multi-Select Tag Cloud)

- **Clubs (Tap to toggle):**
  - `AI/ML Club`, `Web Dev Club`, `Robotics`, `Finance`, `Design`, `Sports`, `Music`, `Open Source`
- **Skills (Tap to toggle):**
  - `Python`, `React`, `DSA`, `Machine Learning`, `Figma`, `Node.js`, `Solidity`, `Go`, `C++`
- **Selected visual state:** Electric blue border, filled accent pill, check icon.

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

---

## 29. STUDENT DIRECTORY (Realistic Mock Student Dataset)

Create 12+ highly realistic, diverse student records spanning all combinations of batches, degrees, hostels, states, achievements, and clubs:
- **Aarav Sharma:** 2029 • BITS • Uniworld 1 • 📍 Karnataka • 👑 President @ AI/ML Club • 🏆 GSoC'25, ICPC Regionalist • 💼 *Doing internship right now* • Python, React, PyTorch • 9.4 CGPA
- **Priya Patel:** 2030 • IITM (CS + AI) • Uniworld 2 • 📍 Gujarat • ⚡ Core Member @ Web Dev • 🏆 SIH'24 Winner • 🚀 *Building side projects* • React, TypeScript, Next.js, Figma • 9.1 CGPA
- **Rohan Verma:** 2028 • BITS • Day Scholar • 📍 Delhi • 👑 Lead @ Open Source Club • 🏆 LFX Mentee • 💻 *Preparing for DSA & interviews* • C++, Go, Kubernetes • 8.8 CGPA
- **Sneha Reddy:** 2029 • IITM • Uniworld 1 • 📍 Telangana • ⚡ Tech Lead @ Robotics • 🏆 Hackathon Winner • 🎮 *Chilling after exams* • ROS, Python, C++, OpenCV • 9.0 CGPA
- **Aditya Nair:** 2030 • BITS (AI + Bio) • Uniworld 2 • 📍 Kerala • 🎨 Design Lead • 💼 *Doing internship* • UI/UX, Figma, Tailwind, Three.js • CGPA Hidden
- *(And additional realistic profiles across Rajasthan, UP, Maharashtra, Bihar, Tamil Nadu, West Bengal...)*

---

## 30. STUDENT PROFILE CARD (Component Breakdown)

Each card in the directory grid includes:
- **Header:** High-res Avatar, Full Name, Verified Student Shield (`✓ SST Verified`), Batch & Degree badge (`2029 • BITS`).
- **Location & Living:** Hostel tag (`Uniworld 1`) and State tag (`📍 Karnataka`).
- **Leadership Badge:** e.g., `👑 President @ AI/ML Club` (Gold pill) or `⚡ Core @ Web Dev` (Cyan pill).
- **Achievement Highlights:** e.g., `🏆 GSoC'25` • `🥇 ICPC Regionalist`.
- **Live Life Status:** e.g., 💼 *Doing internship right now*.
- **Domain & CGPA:** `⭐ 9.2 CGPA` (or `🔒 CGPA Hidden`).
- **Clubs & Skills:** Top 3 skill chips (`Python`, `React`, `DSA`) + `+3 more` counter.
- **Card Actions:**
  - `[ View Profile ]` (Primary dossier trigger)
  - `[ Message ]` (Direct DM trigger with icon)

---

## 31. PROFILE CARD INTERACTIONS & SHORTCUTS

- **Hover / Touch Feedback:** Smooth card elevation, glowing border ring, subtle glass shimmer.
- **Tag Clicks (Smart Filtering):**
  - Clicking a skill chip on a card (e.g., `React`) → Instantly applies `React` filter to directory.
  - Clicking a club badge (e.g., `AI/ML Club`) → Instantly filters directory by that club.
  - Clicking a state tag (e.g., `📍 Karnataka`) → Instantly filters directory by Karnataka students.

---

## 32. DEEP PROFILE VIEW (Student Dossier)

Full-screen sheet on mobile / centered dossier modal on desktop:
- **Hero Banner:** Ambient dark gradient, large student avatar with verified badge.
- **Identity Block:** Full Name, Batch, Degree, Specialization, Hostel, Home State, Bus Commuter status.
- **Live Status Card:** Full current status banner with timestamp.
- **Action Toolbar:** `[ Send Direct Message ]`, `[ Copy Profile Link ]`, `[ Save / Bookmark ]`.

---

## 33. PROFILE SECTIONS & DETAILS

1. **About / Bio:** e.g., *"Building ML systems, participating in hackathons, and trying not to break production."*
2. **Academic Information:** Batch (2029), Degree (BITS Pilani), Specialization (CS + AI), CGPA (9.4 / 10), SGPA (9.6).
3. **Leadership Roles:** Structured cards for presidency, core team, or technical lead roles.
4. **Achievements Showcase:** Highlighting GSoC, LFX, ICPC, SIH, and Hackathon wins with verified gold badges.
5. **Skills Grid:** Interactive chip list categorized by Frontend, Backend, AI/ML, Tools.
6. **Clubs & Communities:** Joined clubs with role designations.
7. **Social & Dev Links:** Direct link pills for GitHub, LinkedIn, Portfolio, and X (Twitter).

---

## 34. SELF PROFILE EDITING

When viewing the logged-in student's own profile, an **`[ Edit Profile ]`** mode is available:
- Edit Name, Bio, and Social URLs (GitHub, LinkedIn, Portfolio, X).
- Update Academic Details: Batch, Degree, Course, CGPA, SGPA.
- Update Campus Information: Hostel (Uniworld 1, Uniworld 2, Day Scholar), Bus Facility (Yes/No), Home State.
- Add / Remove Leadership Roles (Preset titles + Custom role input).
- Add / Remove Achievements (GSoC, LFX, ICPC, SIH, Hackathons + Custom achievement input).
- Toggle Skills & Clubs from searchable tag clouds.
- Update Current Life Status (Quick presets or custom message).
- **Actions:** `[ Cancel ]` and `[ Save Changes ]` with optimistic UI update and success toast.

---

## 35. CGPA PRIVACY TOGGLE

- **Control:** Toggle switch in Profile Editor: `[✓] Show CGPA on public profile`.
- **When Enabled:** Displays `⭐ 9.2 CGPA` on public cards and dossier.
- **When Disabled:** Displays `🔒 CGPA Hidden` on cards, keeping grades private while displaying all skills and achievements.

---

## 36. DIRECT CHAT UI (1-on-1 Messaging)

- **Desktop Layout:** Two-column split-pane (Left: Conversation threads list; Right: Active chat viewport).
- **Mobile Layout:** Conversational thread list with slide-in full-screen chat screen.
- **Chat Header:** Recipient avatar, name, batch badge, online status dot (`Active now`).
- **Chat Feed:** Clean bubble interface with timestamps, status ticks (sent/delivered/read), and realistic mock message histories.
- **Composer Bar:** Input box with placeholder *"Message Aarav..."*, Emoji trigger, File attachment icon, and Send button (`Send` / `ArrowUp` icon).
- **Realistic Dialogue Example:**
  > **You:** *"Hey! Saw you're doing GSoC on ML systems. Are you participating in the upcoming campus hackathon?"*  
  > **Aarav:** *"Yeah! Looking to build an agentic LLM tool. Need someone strong with React/Vite for frontend."*  
  > **You:** *"That's literally my stack haha! Let's team up 🚀"*

---

## 37. GROUP CHAT UI (Auto-Enrolled Channels)

System-managed channels automatically populated by student attributes:
- **Hostel Channels:** `#uniworld-1-residents`, `#uniworld-2-residents`, `#day-scholars-hub`
- **Batch Channels:** `#batch-2030`, `#batch-2029`, `#batch-2028`, `#batch-2027`
- **Club Channels:** `#club-aiml`, `#club-webdev`, `#club-robotics`, `#club-design`, `#club-sports`
- **Transport Channels:** `#campus-bus-commuters`
- **Channel UI:** Channel topic banner, active member count (`142 members online`), rich message feed with sender name and role badge, thread reply counter, and desktop members list.

---

## 38. ACTIVITIES TAB (Phase 2 Live Previews)

Interactive cards organized by campus activity categories:
- 🚗 **Ride Pooling:** *"Uniworld 2 → SST Campus | Leaving in 15 mins | 2/4 seats filled"* → `[ Join Cab Share ]`
- 💡 **Doubt Matching:** *"Need help with Dynamic Programming Assignment (DSA) #Graphs"* → `[ Discuss / Help ]`
- 🏏 **Sports Coordination:** *"Evening Cricket match at Campus Ground (6:00 PM) | 8/12 joined"* → `[ Join Match ]`
- 💻 **Hackathon Teams:** *"Need 1 UI/UX designer for SIH Hackathon sprint"* → `[ Apply to Team ]`
- 🏋️ **Gym Partners:** *"Heading to Uniworld Gym at 7:00 PM (Leg day)"* → `[ Join Partner ]`

---

## 39. PHASE 2 PREVIEW STATES & COMING SOON SCREENS

Never show blank or broken screens. Provide polished, staged preview interfaces:
- **Ride Pool:** Interactive ride creation modal with departure time picker and seat counter.
- **Doubt Solver:** Topic tag clouds (`#DSA`, `#DBMS`, `#OperatingSystems`, `#Python`) with matching preview.
- **Anonymous Community Space:** Moderated preview feed with community guidelines banner and *"Coming Soon"* milestone badge.

---

## 40. ADVANCED SEARCH & FILTERING ENGINE

- Sub-millisecond frontend filtering.
- Supports multi-token queries (e.g., `"2029 Uniworld React"` matches 2029 students staying in Uniworld who know React).
- Highlights matched search substrings in student cards and profiles.

---

## 41. COMPREHENSIVE EMPTY STATES

Polished illustrations / icon states for all empty scenarios:
- **No Students Found:** *"No students match your selected filters."* → `[ Reset All Filters ]`
- **No Active Chats:** *"No conversations yet. Discover batchmates on Explore!"* → `[ Explore Directory ]`
- **No Notifications:** *"You're all caught up! No new notifications."*
- **No Saved Profiles:** *"You haven't bookmarked any profiles yet."*

---

## 42. SKELETON LOADING STATES

- Subtle shimmer skeletons matching exact card and profile dimensions during simulated state transitions.
- Avatar circle skeleton, name block, badge pill skeletons, and action button placeholders.

---

## 43. TOAST NOTIFICATION SYSTEM

Floating glassmorphic toast alerts for all user actions:
- `✓ Profile updated successfully`
- `✓ Status set to: "Building side projects"`
- `✓ Direct message sent to Aarav`
- `✓ Copied profile link to clipboard`
- `✓ Joined #uniworld-1-residents channel`
- `✓ Filter preset applied (24 students)`

---

## 44. MICRO-INTERACTIONS & MOTION DESIGN

- **Timing:** Snappy 150ms–250ms cubic-bezier transitions (`ease-out`).
- **Interactive Elements:** Subtle button push-down scale (`active:scale-95`), filter pill bounce, card border illumination on hover, smooth drawer slide-ins, and tab switch indicators.

---

## 45. ICON SYSTEM (Lucide React)

Consistent Lucide icon mapping throughout the app:
- Navigation: `Compass`, `MessageCircle`, `UsersRound`, `Zap`, `Menu`, `Bell`, `User`, `Search`, `SlidersHorizontal`
- Attributes: `Building2` (Hostel), `GraduationCap` (Degree/Batch), `MapPin` (State), `Award` (Achievements), `Crown` (Leadership), `Briefcase` (Status), `Bus` (Transport), `Code2` (Skills), `ShieldCheck` (Verified)
- Actions: `Send`, `Share2`, `Bookmark`, `Edit3`, `Check`, `X`, `ChevronRight`, `Sparkles`

---

## APPENDIX: TECHNICAL ARCHITECTURE & DATABASE SCHEMA

```sql
-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  batch TEXT NOT NULL,          -- '2030', '2029', '2028', '2027'
  course TEXT,                   -- 'CS + AI', 'AI + Bio'
  degree TEXT NOT NULL,          -- 'IITM', 'BITS'
  hostel TEXT NOT NULL,          -- 'Uniworld 1', 'Uniworld 2', 'Day Scholar'
  bus_facility BOOLEAN DEFAULT false,
  home_state TEXT,               -- 'Karnataka', 'Delhi', 'Maharashtra', etc.
  status_message TEXT,          -- e.g. 'Doing internship right now'
  cgpa NUMERIC(3,2),             -- e.g. 9.40
  show_cgpa BOOLEAN DEFAULT true,
  leadership_roles TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  clubs TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. System-Managed Auto-Channels Table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,            -- e.g. 'Uniworld 1 Residents', 'AI/ML Club'
  slug TEXT UNIQUE NOT NULL,     -- e.g. 'uniworld-1', 'club-aiml'
  category TEXT NOT NULL,        -- 'hostel', 'club', 'facility', 'batch'
  description TEXT,
  avatar_url TEXT
);

-- 3. Channel Memberships
CREATE TABLE channel_members (
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

-- 4. Messages Table (DMs & Channels)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id), -- Null if channel message
  channel_id UUID REFERENCES channels(id),   -- Null if 1-on-1 DM
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


---

## APPENDIX D: PITCH & PRESENTATION SUMMARY (JUDGES)


- **Why this approach is different:** Rather than creating an isolated social feed, CampusConnect uses verified college identities and structured attributes (`Uniworld 1/2`, `Clubs`, `Batch`, `Degree`, `Skills`) to provide instant real-time peer discovery and auto-organized coordination.
- **MVP Execution:** In Phase 1, students log in via Google in seconds, browse the campus directory with fast multi-attribute filter chips, and chat in 1-on-1 DMs or auto-assigned hostel/club group channels.