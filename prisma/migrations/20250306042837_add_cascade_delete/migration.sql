-- DropForeignKey
ALTER TABLE `restaurant` DROP FOREIGN KEY `Restaurant_userId_fkey`;

-- DropIndex
DROP INDEX `Restaurant_userId_key` ON `restaurant`;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
