/*
  Warnings:

  - You are about to drop the column `durationMin` on the `interview_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `interview_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `interview_sessions` table. All the data in the column will be lost.
  - Added the required column `duration_min` to the `interview_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interview_questions" ADD COLUMN     "domain" TEXT NOT NULL DEFAULT 'DevOps';

-- AlterTable
ALTER TABLE "interview_sessions" DROP COLUMN "durationMin",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "domain" TEXT NOT NULL DEFAULT 'DevOps',
ADD COLUMN     "duration_min" INTEGER NOT NULL,
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "experience_level" TEXT NOT NULL DEFAULT 'intermediate',
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
