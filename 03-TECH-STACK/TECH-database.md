# TECH STACK — Database and Caching
## DeployKaro: Data Layer Decisions

---

## Primary Database: PostgreSQL (AWS RDS)

**Why PostgreSQL:**
- Relational data fits the domain (users, tracks, progress, achievements)
- pgvector extension for storing embeddings (avoids separate vector DB in MVP)
- JSONB columns for flexible content storage
- AWS RDS managed — no DBA needed

**Instance:** `db.t3.medium` (MVP), scale to `db.r6g.large` at 10K users

---

## ORM: Prisma (for Content Service)

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  cognitoId     String    @unique
  language      Language  @default(ENGLISH)
  persona       Persona   @default(BUDDY)
  slanglevel    Int       @default(2)       // 1=light, 2=medium, 3=heavy
  createdAt     DateTime  @default(now())
  progress      Progress[]
  achievements  UserAchievement[]
  sessions      MentorSession[]
}

model Track {
  id          String    @id @default(cuid())
  slug        String    @unique             // "my-first-deploy"
  title       String
  durationHrs Float
  order       Int
  modules     Module[]
  progress    Progress[]
}

model Module {
  id            String    @id @default(cuid())
  trackId       String
  track         Track     @relation(fields: [trackId], references: [id])
  title         String
  order         Int
  concepts      Concept[]
}

model Concept {
  id            String    @id @default(cuid())
  moduleId      String
  module        Module    @relation(fields: [moduleId], references: [id])
  title         String
  visualId      String                      // e.g. "vis_docker_tiffin"
  content       Json                        // Structured content per language
  order         Int
}

model Progress {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  trackId       String
  track         Track     @relation(fields: [trackId], references: [id])
  completedPct  Float     @default(0)
  lastConceptId String?
  updatedAt     DateTime  @updatedAt

  @@unique([userId, trackId])
}

model Achievement {
  id          String    @id @default(cuid())
  slug        String    @unique             // "first-deployer"
  title       String
  description String
  badgeUrl    String
  trackId     String?
  users       UserAchievement[]
}

model UserAchievement {
  userId        String
  achievementId String
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  earnedAt      DateTime    @default(now())

  @@id([userId, achievementId])
}

model MentorSession {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  persona   Persona
  messages  Json      // Array of {role, content, timestamp}
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum Language {
  ENGLISH
  TAMIL
  KANNADA
  TELUGU
}

enum Persona {
  BUDDY
  ANNA
  BHAI
  DIDI
}
```

---

## Caching: Redis (AWS ElastiCache)

**Why Redis:**
- Sub-millisecond response for cached mentor answers
- Session storage for mentor conversation history
- Rate limiting counters
- Real-time sandbox state

**Cache Keys Design:**

```
mentor:cache:{hash(persona+question)}     → Cached mentor response (TTL: 24h)
session:{userId}:history                  → Last 50 mentor messages (TTL: 7d)
session:{userId}:sandbox                  → Sandbox terminal state (TTL: 2h)
ratelimit:{userId}:messages               → Message count for rate limiting (TTL: 1d)
ratelimit:{ip}:requests                   → IP-level rate limiting (TTL: 1m)
```

**Instance:** `cache.t3.micro` (MVP), scale to `cache.r6g.large` at 10K users

---

## Vector Search: pgvector (PostgreSQL Extension)

For semantic search across learning content (no separate Pinecone needed in MVP):

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to concepts
ALTER TABLE concepts ADD COLUMN embedding vector(1024);

-- Semantic search query
SELECT id, title, 1 - (embedding <=> $1::vector) AS similarity
FROM concepts
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

---

## Data Backup and Retention

```
RDS Automated Backups:    7 days retention
RDS Snapshots:            Weekly manual snapshots, 30 days retention
Redis:                    AOF persistence enabled, daily S3 backup
User data deletion:       GDPR-compliant deletion within 30 days of request
```
