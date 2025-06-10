-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "json_template" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Page" ALTER COLUMN "global_settings" DROP NOT NULL;
