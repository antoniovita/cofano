-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'pt',
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'DARK';
