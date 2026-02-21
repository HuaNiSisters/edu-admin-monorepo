-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('attending', 'alumni');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('cabramatta_and_canley_vale', 'parramatta', 'online');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('primary', 'selective', 'oc', 'mathematics', 'english', 'science', 'biology', 'chemistry', 'physics', 'economics');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent');

-- CreateEnum
CREATE TYPE "EnrolmentStatus" AS ENUM ('active', 'pending', 'completed', 'cancelled', 'unenrolled');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('cash', 'bank_transfer', 'other');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateTable
CREATE TABLE "Student" (
    "student_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_mobile" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "preferred_name" TEXT,
    "grade_at_school" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "suburb_of_home" TEXT NOT NULL,
    "email" TEXT,
    "location" "Location" NOT NULL,
    "gender" "Gender",
    "status" "StudentStatus",
    "notes" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "parent_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_mobile" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("parent_id")
);

-- CreateTable
CREATE TABLE "StudentParent" (
    "student_parent_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "relationship" TEXT,

    CONSTRAINT "StudentParent_pkey" PRIMARY KEY ("student_parent_id")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "tutor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("tutor_id")
);

-- CreateTable
CREATE TABLE "ClassTime" (
    "class_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offering_id" UUID NOT NULL,
    "tutor_id" UUID,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "capacity" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClassTime_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subject_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" "SubjectType" NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "school_year_number" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "SubjectOffering" (
    "offering_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "location" "Location" NOT NULL,
    "price_per_term" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "SubjectOffering_pkey" PRIMARY KEY ("offering_id")
);

-- CreateTable
CREATE TABLE "Term" (
    "term_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "Enrolment" (
    "enrolment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "enrolment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrolmentStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Enrolment_pkey" PRIMARY KEY ("enrolment_id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "week" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "enrolment_id" UUID NOT NULL,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "payment_type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "receipt" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "_SubjectToTutor" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_SubjectToTutor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectOffering_subject_id_grade_id_location_key" ON "SubjectOffering"("subject_id", "grade_id", "location");

-- CreateIndex
CREATE UNIQUE INDEX "Term_year_name_key" ON "Term"("year", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_student_id_class_id_term_id_key" ON "Enrolment"("student_id", "class_id", "term_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_class_id_week_key" ON "Attendance"("student_id", "class_id", "week");

-- CreateIndex
CREATE INDEX "_SubjectToTutor_B_index" ON "_SubjectToTutor"("B");

-- AddForeignKey
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("parent_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTime" ADD CONSTRAINT "ClassTime_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "SubjectOffering"("offering_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTime" ADD CONSTRAINT "ClassTime_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("tutor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "Grade"("grade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "ClassTime"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "ClassTime"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "Enrolment"("enrolment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToTutor" ADD CONSTRAINT "_SubjectToTutor_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToTutor" ADD CONSTRAINT "_SubjectToTutor_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutor"("tutor_id") ON DELETE CASCADE ON UPDATE CASCADE;
