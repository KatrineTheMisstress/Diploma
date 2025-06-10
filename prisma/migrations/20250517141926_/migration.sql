/*
  Warnings:

  - You are about to drop the column `order` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_user_id_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "order_in_page" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "order",
DROP COLUMN "project_id";

-- DropTable
DROP TABLE "Project";
