/*
  Warnings:

  - You are about to drop the column `name` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubjectOffering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubjectToTutor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subject_name,grade,location]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grade` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_term` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_name` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClassTime" DROP CONSTRAINT "ClassTime_offering_id_fkey";

-- DropForeignKey
ALTER TABLE "SubjectOffering" DROP CONSTRAINT "SubjectOffering_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "SubjectOffering" DROP CONSTRAINT "SubjectOffering_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTutor" DROP CONSTRAINT "_SubjectToTutor_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTutor" DROP CONSTRAINT "_SubjectToTutor_B_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "name",
ADD COLUMN     "grade" INTEGER NOT NULL,
ADD COLUMN     "location" "Location" NOT NULL,
ADD COLUMN     "price_per_term" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subject_name" TEXT NOT NULL,
ADD COLUMN     "tutorTutor_id" UUID;

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "SubjectOffering";

-- DropTable
DROP TABLE "_SubjectToTutor";

-- DropEnum
DROP TYPE "SubjectType";

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subject_name_grade_location_key" ON "Subject"("subject_name", "grade", "location");

-- AddForeignKey
ALTER TABLE "ClassTime" ADD CONSTRAINT "ClassTime_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tutorTutor_id_fkey" FOREIGN KEY ("tutorTutor_id") REFERENCES "Tutor"("tutor_id") ON DELETE SET NULL ON UPDATE CASCADE;
