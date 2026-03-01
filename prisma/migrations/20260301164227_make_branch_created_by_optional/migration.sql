-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_createdById_fkey";

-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
