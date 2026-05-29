-- AlterTable
ALTER TABLE "dosen" ADD COLUMN     "pangkat_golongan" TEXT;

-- AlterTable
ALTER TABLE "workflow_step_actions" ALTER COLUMN "target_status" DROP NOT NULL;
