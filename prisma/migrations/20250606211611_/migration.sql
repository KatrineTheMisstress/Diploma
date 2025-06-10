/*
  Warnings:

  - You are about to drop the column `height` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `order_in_page` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `page_id` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `position_x` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `position_y` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the `Animation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Navigation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `html_template` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styles` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated-at` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_data` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated-at` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Animation" DROP CONSTRAINT "Animation_block_id_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_block_id_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_page_id_fkey";

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_block_id_fkey";

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_target_page_id_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "height",
DROP COLUMN "order_in_page",
DROP COLUMN "page_id",
DROP COLUMN "position_x",
DROP COLUMN "position_y",
DROP COLUMN "settings",
DROP COLUMN "width",
ADD COLUMN     "created-at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "html_template" TEXT NOT NULL,
ADD COLUMN     "styles" TEXT NOT NULL,
ADD COLUMN     "updated-at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "created-at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "page_data" JSONB NOT NULL,
ADD COLUMN     "updated-at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Animation";

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "Navigation";

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
