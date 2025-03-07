-- AlterTable
ALTER TABLE `environment` ADD COLUMN `mediaType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `menuitem` ADD COLUMN `mediaType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `restaurant` ADD COLUMN `mediaType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `signaturedish` ADD COLUMN `mediaType` VARCHAR(191) NULL;
