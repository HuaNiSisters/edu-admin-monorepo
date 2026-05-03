/*
  Warnings:

  - A unique constraint covering the columns `[student_id,class_id,term_id,week]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `term_id` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attendance_student_id_class_id_week_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "term_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_class_id_term_id_week_key" ON "Attendance"("student_id", "class_id", "term_id", "week");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE CASCADE ON UPDATE CASCADE;
