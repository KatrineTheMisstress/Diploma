/*
  Warnings:

  - You are about to drop the column `project_id` on the `Asset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_project_id_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "project_id";
