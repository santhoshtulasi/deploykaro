# ARCHITECTURE — Data Models
## DeployKaro: Database Schema and Data Models

---

## Entity Relationship Overview

```
User ──────────────── Progress (many per user, one per track)
 │                         │
 │                       Track ──── Module ──── Concept
 │
 ├──── UserAchievement ── Achievement
 │
 ├──── MentorSession (conversation history)
 │
 ├──── InterviewSession (mock interview + scorecard)
 │
 ├──── ResumeProfile (resume text + scores + rewrites)
 │
 ├──── CertProgress (per-certification readiness tracking)
 │
 └──── ExpertBooking ──── ExpertProfile
```

---

## Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────────

enum Language {
  ENGLISH
  TAMIL
  KANNADA
  TELUGU
}

enum Persona {
  BUDDY    // English
  ANNA     // Tamil
  BHAI     // Kannada
  DIDI     // Telugu
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum SlangLevel {
  LIGHT    // 1
  MEDIUM   // 2
  HEAVY    // 3
}

// ─── USER ────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  cognitoId     String    @unique @map("cognito_id")
  displayName   String?   @map("display_name")
  avatarUrl     String?   @map("avatar_url")
  language      Language  @default(ENGLISH)
  persona       Persona   @default(BUDDY)
  slangLevel    SlangLevel @default(MEDIUM) @map("slang_level")
  expertMode    Boolean   @default(false) @map("expert_mode")
  parentId      String?   @map("parent_id")
  parent        User?     @relation("ParentChild", fields: [parentId], references: [id])
  children      User[]    @relation("ParentChild")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  progress      Progress[]
  achievements  UserAchievement[]
  sessions      MentorSession[]

  @@map("users")
}

// ─── TRACKS ──────────────────────────────────────────────────

model Track {
  id            String    @id @default(cuid())
  slug          String    @unique
  order         Int
  durationHrs   Float     @map("duration_hrs")
  difficulty    Difficulty @default(BEGINNER)
  isPublished   Boolean   @default(false) @map("is_published")

  titleEn       String    @map("title_en")
  titleTa       String?   @map("title_ta")
  titleKn       String?   @map("title_kn")
  titleTe       String?   @map("title_te")

  modules       Module[]
  progress      Progress[]
  achievement   Achievement?

  @@map("tracks")
}

model Module {
  id            String    @id @default(cuid())
  trackId       String    @map("track_id")
  track         Track     @relation(fields: [trackId], references: [id])
  order         Int

  titleEn       String    @map("title_en")
  titleTa       String?   @map("title_ta")
  titleKn       String?   @map("title_kn")
  titleTe       String?   @map("title_te")

  concepts      Concept[]

  @@map("modules")
}

model Concept {
  id            String    @id @default(cuid())
  moduleId      String    @map("module_id")
  module        Module    @relation(fields: [moduleId], references: [id])
  order         Int
  visualId      String?   @map("visual_id")

  titleEn       String    @map("title_en")
  titleTa       String?   @map("title_ta")
  titleKn       String?   @map("title_kn")
  titleTe       String?   @map("title_te")

  content       Json      // Structured content: analogies, technical, hands-on
  embedding     Unsupported("vector(1024)")?  // pgvector for semantic search

  @@map("concepts")
}

// ─── PROGRESS ────────────────────────────────────────────────

model Progress {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  user              User      @relation(fields: [userId], references: [id])
  trackId           String    @map("track_id")
  track             Track     @relation(fields: [trackId], references: [id])
  completedPct      Float     @default(0) @map("completed_pct")
  completedConcepts String[]  @map("completed_concepts")
  lastConceptId     String?   @map("last_concept_id")
  totalTimeSecs     Int       @default(0) @map("total_time_secs")
  startedAt         DateTime  @default(now()) @map("started_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@unique([userId, trackId])
  @@map("progress")
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────

model Achievement {
  id            String    @id @default(cuid())
  slug          String    @unique
  trackId       String?   @unique @map("track_id")
  track         Track?    @relation(fields: [trackId], references: [id])
  badgeUrl      String    @map("badge_url")

  titleEn       String    @map("title_en")
  descriptionEn String    @map("description_en")

  users         UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  userId        String    @map("user_id")
  achievementId String    @map("achievement_id")
  user          User      @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  earnedAt      DateTime  @default(now()) @map("earned_at")

  @@id([userId, achievementId])
  @@map("user_achievements")
}

// ─── MENTOR SESSIONS ──────────────────────────────────────────

model MentorSession {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  user          User      @relation(fields: [userId], references: [id])
  persona       Persona
  messageCount  Int       @default(0) @map("message_count")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Full message history stored in Redis for performance
  // Only metadata stored in PostgreSQL

  @@map("mentor_sessions")
}
```

---

## Concept Content JSON Structure

```json
{
  "analogy": {
    "en": "Docker is like a lunchbox...",
    "ta": "Docker oru tiffin box maari...",
    "kn": "Docker oru tiffin box tara...",
    "te": "Docker oka tiffin box laaga..."
  },
  "technical": {
    "en": "Docker packages your application and all its dependencies...",
    "ta": "Docker unoda app-um adha run panna thevaiyana ellathayum...",
    "kn": "Docker ninna app mattu adara dependencies ellava...",
    "te": "Docker mee app ni mariyu daani dependencies anni..."
  },
  "hands_on": {
    "command": "docker build -t myapp .",
    "expected_output": "Successfully built abc123def456",
    "explanation_en": "This command builds a Docker image from your Dockerfile",
    "explanation_ta": "Idha run pannunga — unoda Dockerfile la irundhu image build aagum"
  },
  "visual_id": "vis_docker_tiffin",
  "quiz": {
    "question_en": "What problem does Docker solve?",
    "options_en": [
      "Makes code run faster",
      "Ensures app runs the same everywhere",
      "Replaces the need for a server",
      "Automatically writes code"
    ],
    "correct_index": 1
  }
}
```
