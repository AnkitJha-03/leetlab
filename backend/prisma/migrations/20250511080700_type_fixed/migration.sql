/*
  Warnings:

  - You are about to drop the `ProblemInPlaylis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProblemInPlaylis" DROP CONSTRAINT "ProblemInPlaylis_problemId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemInPlaylis" DROP CONSTRAINT "ProblemInPlaylis_sheetId_fkey";

-- DropTable
DROP TABLE "ProblemInPlaylis";

-- CreateTable
CREATE TABLE "ProblemInSheet" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemInSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProblemInSheet_sheetId_problemId_key" ON "ProblemInSheet"("sheetId", "problemId");

-- AddForeignKey
ALTER TABLE "ProblemInSheet" ADD CONSTRAINT "ProblemInSheet_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemInSheet" ADD CONSTRAINT "ProblemInSheet_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
