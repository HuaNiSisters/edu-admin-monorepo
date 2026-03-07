/*
  Warnings:

  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassTime" DROP CONSTRAINT "ClassTime_offering_id_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_tutorTutor_id_fkey";

-- DropTable
DROP TABLE "Subject";

-- CreateTable
CREATE TABLE "SubjectOffering" (
    "subject_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject_name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "location" "Location" NOT NULL,
    "price_per_term" DECIMAL(10,2) NOT NULL,
    "tutorTutor_id" UUID,

    CONSTRAINT "SubjectOffering_pkey" PRIMARY KEY ("subject_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectOffering_subject_name_grade_location_key" ON "SubjectOffering"("subject_name", "grade", "location");

-- AddForeignKey
ALTER TABLE "ClassTime" ADD CONSTRAINT "ClassTime_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "SubjectOffering"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_tutorTutor_id_fkey" FOREIGN KEY ("tutorTutor_id") REFERENCES "Tutor"("tutor_id") ON DELETE SET NULL ON UPDATE CASCADE;
