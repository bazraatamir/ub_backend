-- DropForeignKey
ALTER TABLE `hero` DROP FOREIGN KEY `Hero_approvedBy_fkey`;

-- DropIndex
DROP INDEX `Hero_approvedBy_fkey` ON `hero`;

-- AddForeignKey
ALTER TABLE `Hero` ADD CONSTRAINT `Hero_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
