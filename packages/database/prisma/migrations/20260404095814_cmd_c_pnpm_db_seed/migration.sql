-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PENDING', 'SOLD', 'INACTIVE');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "location" TEXT,
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "SavedProperty" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "phone" TEXT;
