/*
  Warnings:

  - Added the required column `createdById` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the column as nullable first
ALTER TABLE "Branch" ADD COLUMN "createdById" TEXT;

-- Step 2: Set existing branches to be created by the first admin (or a default admin)
UPDATE "Branch" 
SET "createdById" = (SELECT id FROM "Admin" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "createdById" IS NULL;

-- Step 3: Make the column required
ALTER TABLE "Branch" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
