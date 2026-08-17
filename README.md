# 📖 EECMY Lectionary (የዕለት) — Daily Scripture Companion

**EECMY Lectionary (የዕለት)** is a modern, offline-first mobile application built for mobile platforms (iOS & Android) that provides daily scripture readings, liturgical day information, holy commemorations, and calendar synchronization based on the **Ethiopian Evangelical Church Mekane Yesus (EECMY / የኢትዮጵያ ወንጌላዊት ቤተ ክርስቲያን መካነ ኢየሱስ)** lectionary calendar.

Built with **React Native**, **Expo SDK 54**, **Expo SQLite**, and **NativeWind v5**, EECMY Lectionary features dual calendar support (Ethiopian EC & Gregorian GC), offline lectionary data management, content pack updates, daily notification reminders, and a customizable reader interface.

---

## ✨ Key Features

### 📅 Dual Calendar & EECMY Lectionary Reader
- **Ethiopian (EC) & Gregorian (GC) Calendar Sync**: Seamlessly switch between the Ethiopian Calendar (13 months) and the Gregorian Calendar.
- **Evangelist Year Tracking**: Automatic calculation of Ethiopian Evangelist years (*Matthew*, *Mark*, *Luke*, *John*).
- **Daily EECMY Lectionary Readings**: View daily Old Testament, Epistle, and Gospel lectionary readings for any day of the year according to the EECMY liturgical calendar.
- **Sunday & Festival Expanded View**: Smooth glide navigation across multi-passage lectionary readings for Sundays and major church festivals.
- **Feast & Commemoration Markers**: Built-in liturgical day markers powered by SQLite synchronization.

### 🎨 Customizable Reader Experience
- **Apple Reader Style Control Bar**: Ultra-compact typography controls for quick text resizing (`A−` / `A+`) and alignment adjustment (`Left`, `Center`, `Justify`).
- **Scripture Translation Picker**: Unified vertical selector for switching lectionary Bible translations across multiple languages.
- **Dark Mode & Glassmorphism**: Tailored light & dark themes with soft warm tones designed for comfortable reading.

### 🌐 Multilingual Support (i18n)
- **Built-in Languages**: Full UI localization in:
  - 🇪🇹 **Amharic (`አማርኛ`)**
  - 🇬🇧 **English**
  - 🇪🇹 **Oromo (`Afaan Oromoo`)**

### 📦 Offline-First & Content Update Architecture
- **Embedded SQLite**: Bundled with local lectionary SQLite database (`readings.db`) for 100% offline access without needing an internet connection.
- **Transactional Content Update Sync**: Download yearly EECMY lectionary packs, holiday metadata, and translation updates directly into SQLite without overwriting user preferences.
- **Current & Future Year Smart Check**: Intelligent update checking that filters indicators to current and future calendar years.

### 🔔 Daily Reading Reminders & Favourites
- **Local Push Notifications**: Schedule daily reading notification reminders with custom lectionary excerpts using `expo-notifications`.
- **Bookmarked Favourites**: Save and reference daily scripture readings offline.

---

## 🔄 Content Updates & Synchronization Architecture

YeiLet implements an offline-first, transactional content updates and synchronization architecture designed for seamless lectionary data management:

### 1. Remote Manifest Discovery (`manifest.json`)
The application queries remote content manifests to discover available lectionary years, language translations, holiday packages, and content version numbers.

### 2. Smart Year Update Filter
- The homepage header update indicator evaluates content version numbers for the **current Ethiopian calendar year and subsequent years**.
- Past years remain fully browsable and downloadable inside the **Content Update Wizard** (`/settings/check-updates/content`).

### 3. Atomic SQLite Transactions
- Downloads execute inside an atomic SQLite transaction (`db.withTransactionAsync`).
- `Reading`, `Holiday`, `DayInfo`, and `SyncRecord` statements commit atomically. If network failure or interruption occurs mid-download, SQLite rolls back changes cleanly to prevent database corruption.

### 4. SyncRecord Tracking
- The `SyncRecord` table maintains device sync history for each content package (`type`, `language`, `version`, `year`, `checksum`, `contentVersion`).
- Prevents redundant network downloads and ensures custom user content is preserved across app updates.

### 5. Settings Auto-Normalization & Cache Invalidation
- When a download succeeds, `refreshAvailableLanguages()` queries SQLite and automatically updates the active `language` and `version` settings if current settings are empty or invalid.
- React Query caches (`readings`, `dayReadings`, `holidays`) are invalidated across the app to display new content instantly without needing an app restart.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Church Tradition** | [Ethiopian Evangelical Church Mekane Yesus (EECMY)](https://www.eecmy.org/) |
| **Framework** | [React Native](https://reactnative.dev/) (v0.81) / [Expo SDK 54](https://docs.expo.dev/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Database** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (`readings.db`) |
| **Styling** | [NativeWind v5](https://www.nativewind.dev/) (Tailwind CSS v4) |
| **Data Fetching** | [@tanstack/react-query](https://tanstack.com/query/latest) (React Query v5) |
| **UI Components** | [@gorhom/bottom-sheet](https://gorhom.github.io/react-native-bottom-sheet/), [@expo/vector-icons](https://icons.expo.fyi/) |
| **Notifications** | [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| **Date Conversion** | Custom Ethiopian & Gregorian Calendar algorithms (`ethiopian-calendar-date-converter`) |

---

## 📂 Project Architecture & Directory Structure

```text
YeiLet/
├── app/                        # Expo Router Pages & Navigation
│   ├── (tabs)/                 # Main Bottom Tab Navigation
│   │   ├── index.tsx           # Home Screen (Daily Reading Preview & Calendar Card)
│   │   ├── calendar.tsx        # EECMY Month Grid & Festival Calendar
│   │   ├── favourites.tsx      # Saved Favourites List
│   │   └── settings.tsx        # App Settings Overview
│   ├── onboarding/             # First-Time User Onboarding Wizard
│   │   ├── index.tsx           # Welcome Screen
│   │   ├── features.tsx        # Feature Highlights
│   │   ├── language.tsx        # Initial Language & Version Selection
│   │   └── complete.tsx        # Onboarding Completion Screen
│   ├── reading/                # Lectionary Reader Detail Page
│   │   └── index.tsx           # Full Passage Reader (Simple / Sunday Expanded View)
│   ├── settings/               # Deep Settings & Wizard Screens
│   │   ├── check-updates/      # Content Update Download Wizard
│   │   ├── calendar.tsx        # Calendar System Preference
│   │   ├── language.tsx        # Translation Manager
│   │   └── reminder.tsx        # Daily Notification Alarm Schedule
│   └── _layout.tsx             # Root Provider Hierarchy & Gesture Handler Root
├── assets/                     # Fonts, Images, and Pre-populated DB
│   └── db/
│       └── readings.db         # Bundled SQLite EECMY Lectionary Database
├── components/                 # Reusable UI Components
│   ├── calendar/               # Month Grid & Day Cells
│   ├── check-updates/          # Download Wizard Steps & Progress Bar
│   └── reading/                # Reading Cards, Capsule Toolbar, Language Picker
├── lib/                        # Core Domain Logic, Services & Contexts
│   ├── content/                # Content Repository & Statement Builders
│   ├── hooks/                  # Custom React Hooks (Favourites, Holidays, Updates)
│   ├── database.ts             # SQLite Query Engine & Schema Handler
│   ├── ethiopianCalendar.ts    # EC/GC Algorithms & Evangelist Calculations
│   ├── i18n.ts                 # Multilingual Localization Dictionaries
│   ├── NotificationService.ts  # Push Notification Scheduler
│   ├── OnboardingContext.tsx   # Onboarding State Management
│   └── SettingsContext.tsx     # App Settings & Language Auto-Normalization
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and `pnpm` installed. For mobile execution, install Expo Go on your physical device or set up iOS Simulator / Android Emulator.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/yeilet.git
cd yeilet
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Locally with Expo
```bash
pnpm start
```
* Press `a` to open in Android Emulator
* Press `i` to open in iOS Simulator
* Scan the QR code with Expo Go on your mobile device

---

## 💾 Database Schema Overview

YeiLet relies on an embedded SQLite database (`readings.db`). The database schema is defined as follows:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum HolidayType {
  EECMY
  CHRISTIAN
  OTHER
}

enum ReadingSection {
  OLD_TESTAMENT
  EPISTLE
  GOSPEL
}

/// A single reading within a content pack.
/// Language, version, and date uniquely identify a reading.
/// Year is derived from date — not stored redundantly.
model Reading {
  id        String         @id @default(cuid())
  language  String
  version   String
  date      String
  order     Int
  section   ReadingSection
  reference String
  text      String

  @@unique([language, version, date, order])
  @@index([language, version, date])
}

/// A holiday entry tied to a language and date.
/// No wrapper table — language and date are directly on the model.
model Holiday {
  id       String      @id @default(cuid())
  language String
  date     String
  type     HolidayType
  name     String

  @@unique([language, date, type, name])
  @@index([language, date])
}

/// Locale-specific title and description for a day.
/// Shared across all versions of the same language.
model DayInfo {
  id          String   @id @default(cuid())
  language    String
  date        String
  title       String?
  description String?

  @@unique([language, date])
}

/// Tracks what content the device has downloaded and when.
/// Used by the sync function to avoid re-downloading unchanged content.
/// Lives in the same SQLite DB as content — atomically tied.
// This will have atleast 1 record for each pack type
model SyncRecord {
  id               String   @id @default(cuid())
  type             String   // 'reading', 'holiday', 'dayinfo'
  language         String
  languageFullName String
  version          String?  // null for holidays and dayinfo MACQUL
  versionFullName  String?  // Macaafa Qulqulluu Afaan Oromoo
  versionMetaData  Json?    // Other details like publisher, publish date, license and others
  year             Int
  checksum         String   // SHA-256 hex string
  pulledAt         DateTime // when this was last successfully synced
  contentVersion   Int      @default(1)

  @@unique([type, language, version, year])
}

model Favourite {
  date      String
  order     Int
  createdAt DateTime @default(now())

  @@id([date, order])
}
```
