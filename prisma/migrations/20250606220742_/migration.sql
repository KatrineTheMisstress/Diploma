/*
  Warnings:

  - Added the required column `global_settings` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "global_settings" JSONB NOT NULL;
