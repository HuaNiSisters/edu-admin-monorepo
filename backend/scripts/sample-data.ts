import { prisma } from "../src/lib/prisma.ts";

/**
 * Test-data identifiers are intentionally kept in one place.  Cleanup only
 * touches records associated with these email addresses; it never truncates
 * application tables.
 */
const SAMPLE_DOMAIN = "sample.eduadmin.test";
// Kept solely to clean records produced by earlier versions of this script.
const LEGACY_SAMPLE_OFFERING_PREFIX = "Sample ";

const firstNames = [
  "Aarav", "Amelia", "Arjun", "Charlotte", "Chloe", "Daniel", "Ella", "Ethan",
  "Grace", "Hamish", "Isla", "Jack", "Jasmine", "Kai", "Lachlan", "Layla",
  "Leo", "Liam", "Lucas", "Mia", "Noah", "Olivia", "Priya", "Ruby", "Sienna",
];
const lastNames = [
  "Anderson", "Brown", "Chen", "Davis", "Edwards", "Garcia", "Harris", "Jones",
  "Khan", "Lee", "Martin", "Nguyen", "O'Brien", "Patel", "Roberts", "Singh",
  "Smith", "Taylor", "Wang", "Wilson",
];

const classBlueprints = [
  [7, "Primary", "Monday", "16:00", "17:30"], [7, "Selective", "Tuesday", "16:00", "17:30"],
  [7, "OC", "Wednesday", "16:00", "17:30"], [7, "Mathematics", "Saturday", "09:00", "10:30"],
  [8, "English", "Monday", "17:45", "19:15"], [8, "Science", "Tuesday", "17:45", "19:15"],
  [8, "Biology", "Wednesday", "17:45", "19:15"], [8, "Chemistry", "Saturday", "10:45", "12:15"],
  [9, "Physics", "Thursday", "16:00", "17:30"], [9, "Economics", "Friday", "16:00", "17:30"],
  [9, "Mathematics", "Thursday", "17:45", "19:15"], [9, "English", "Saturday", "13:00", "14:30"],
  [10, "Science", "Monday", "16:00", "17:30"], [10, "Selective", "Tuesday", "16:00", "17:30"],
  [10, "Mathematics", "Wednesday", "16:00", "17:30"], [10, "English", "Saturday", "14:45", "16:15"],
  [11, "Physics", "Monday", "17:45", "19:15"], [11, "Economics", "Tuesday", "17:45", "19:15"],
  [12, "Mathematics", "Thursday", "16:00", "17:30"], [12, "English", "Friday", "16:00", "17:30"],
] as const;

const classLocations = Array.from({ length: classBlueprints.length }, (_, index) =>
  index < classBlueprints.length / 2 ? "cabramatta_and_canley_vale" as const : "parramatta" as const,
).sort(() => Math.random() - 0.5);

const termDates = [
  { name: 1, start: new Date("2026-01-27"), end: new Date("2026-04-02") },
  { name: 2, start: new Date("2026-04-20"), end: new Date("2026-06-26") },
  { name: 3, start: new Date("2026-07-13"), end: new Date("2026-09-18") },
  { name: 4, start: new Date("2026-10-06"), end: new Date("2026-12-11") },
];

function email(kind: string, index: number) {
  return `${kind}.${String(index).padStart(3, "0")}@${SAMPLE_DOMAIN}`;
}

function dateInWeek(termStart: Date, week: number) {
  const date = new Date(termStart);
  date.setDate(date.getDate() + (week - 1) * 7 + 2);
  return date;
}

async function cleanSampleData() {
  const students = await prisma.student.findMany({
    where: { email: { endsWith: `@${SAMPLE_DOMAIN}` } },
    select: { student_id: true },
  });
  const studentIds = students.map((student) => student.student_id);
  const tutors = await prisma.tutor.findMany({
    where: { email: { endsWith: `@${SAMPLE_DOMAIN}` } },
    select: { tutor_id: true },
  });
  const tutorIds = tutors.map((tutor) => tutor.tutor_id);
  const offerings = await prisma.subjectOffering.findMany({
    where: {
      OR: [
        { subject_name: { startsWith: LEGACY_SAMPLE_OFFERING_PREFIX } },
        ...(tutorIds.length ? [{ tutorTutor_id: { in: tutorIds } }] : []),
      ],
    },
    select: { subject_id: true },
  });
  const offeringIds = offerings.map((offering) => offering.subject_id);
  const classes = offeringIds.length
    ? await prisma.classTime.findMany({ where: { offering_id: { in: offeringIds } }, select: { class_id: true } })
    : [];
  const classIds = classes.map((classTime) => classTime.class_id);
  const enrolments = studentIds.length
    ? await prisma.enrolment.findMany({ where: { student_id: { in: studentIds } }, select: { enrolment_id: true } })
    : [];
  const enrolmentIds = enrolments.map((enrolment) => enrolment.enrolment_id);

  await prisma.$transaction([
    ...(enrolmentIds.length ? [prisma.payment.deleteMany({ where: { enrolment_id: { in: enrolmentIds } } })] : []),
    ...(studentIds.length ? [prisma.attendance.deleteMany({ where: { student_id: { in: studentIds } } })] : []),
    ...(studentIds.length ? [prisma.enrolment.deleteMany({ where: { student_id: { in: studentIds } } })] : []),
    ...(studentIds.length ? [prisma.studentParent.deleteMany({ where: { student_id: { in: studentIds } } })] : []),
    ...(studentIds.length ? [prisma.student.deleteMany({ where: { student_id: { in: studentIds } } })] : []),
    ...(classIds.length ? [prisma.classTime.deleteMany({ where: { class_id: { in: classIds } } })] : []),
    ...(offeringIds.length ? [prisma.subjectOffering.deleteMany({ where: { subject_id: { in: offeringIds } } })] : []),
    ...(tutorIds.length ? [prisma.tutor.deleteMany({ where: { tutor_id: { in: tutorIds } } })] : []),
  ]);

  // Parent records are only deleted when they have no remaining child links.
  const sampleParents = await prisma.parent.findMany({
    where: { email: { endsWith: `@${SAMPLE_DOMAIN}` } },
    include: { children: true },
  });
  await prisma.parent.deleteMany({
    where: { parent_id: { in: sampleParents.filter((parent) => parent.children.length === 0).map((parent) => parent.parent_id) } },
  });
}

async function seedSampleData() {
  await cleanSampleData();

  const terms = await Promise.all(termDates.map((term) => prisma.term.upsert({
    where: { year_name: { year: 2026, name: term.name } },
    update: { start_date: term.start, end_date: term.end },
    create: { year: 2026, name: term.name, start_date: term.start, end_date: term.end },
  })));
  const currentTerm = terms[2]!;

  const tutors = await Promise.all(Array.from({ length: 10 }, (_, index) => prisma.tutor.create({
    data: { first_name: firstNames[index]!, last_name: lastNames[index]!, phone: `0400 ${String(100000 + index).slice(-3)} ${String(200 + index)}`, email: email("tutor", index + 1) },
  })));

  const classes = await Promise.all(classBlueprints.map(async ([grade, subjectName, day, start, end], index) => {
    const location = classLocations[index]!;
    const offering = await prisma.subjectOffering.create({
      data: { subject_name: subjectName, grade, location, price_per_term: subjectName === "OC" ? 320 : 300, tutorTutor_id: tutors[index % tutors.length]!.tutor_id },
    });
    return prisma.classTime.create({
      data: { offering_id: offering.subject_id, tutor_id: tutors[index % tutors.length]!.tutor_id, day_of_week: day, start_time: start, end_time: end, capacity: 18, active: true },
    });
  }));

  const students = await Promise.all(Array.from({ length: 100 }, (_, index) => prisma.student.create({
    data: {
      first_name: firstNames[index % firstNames.length]!, last_name: lastNames[(index * 3) % lastNames.length]!,
      preferred_name: index % 9 === 0 ? firstNames[(index + 1) % firstNames.length]! : null,
      student_mobile: `040${String(1000000 + index).slice(-7)}`, email: email("student", index + 1),
      grade_at_school: 7 + (index % 6), school: ["Canley Vale High School", "Cabramatta High School", "Parramatta High School", "Sydney Girls High School"][index % 4]!,
      suburb_of_home: ["Cabramatta", "Canley Vale", "Fairfield", "Parramatta", "Lidcombe"][index % 5]!,
      location: index % 8 === 0 ? "online" : "cabramatta_and_canley_vale", gender: index % 2 === 0 ? "F" : "M", status: index % 23 === 0 ? "alumni" : "attending",
      notes: index % 17 === 0 ? "Sample record: learning support discussed with parent." : null,
    },
  })));

  const parents = await Promise.all(Array.from({ length: 120 }, (_, index) => prisma.parent.create({
    data: { first_name: firstNames[(index + 5) % firstNames.length]!, last_name: lastNames[(index * 7) % lastNames.length]!, parent_mobile: `041${String(2000000 + index).slice(-7)}`, email: email("parent", index + 1) },
  })));
  await prisma.studentParent.createMany({ data: students.flatMap((student, index) => [
    { student_id: student.student_id, parent_id: parents[index]!.parent_id, relationship: "Parent" },
    ...(index % 3 === 0 ? [{ student_id: student.student_id, parent_id: parents[100 + (index % 20)]!.parent_id, relationship: "Guardian" }] : []),
  ]) });

  const enrolments = await Promise.all(students.flatMap((student, index) => {
    const gradeClasses = classes.filter((_, classIndex) => classBlueprints[classIndex]![0] === student.grade_at_school);
    const primary = gradeClasses[index % gradeClasses.length]!;
    const secondary = gradeClasses[(index + 1) % gradeClasses.length]!;
    return [primary, secondary].map((classTime, offset) => prisma.enrolment.create({
      data: { student_id: student.student_id, class_id: classTime.class_id, term_id: currentTerm.term_id, enrolment_date: new Date("2026-07-01"), status: index % 29 === 0 && offset === 1 ? "pending" : "active" },
    }));
  }));

  const attendanceRows = enrolments.flatMap((enrolment, index) => Array.from({ length: 10 }, (_, weekIndex) => ({
    student_id: enrolment.student_id, class_id: enrolment.class_id, term_id: currentTerm.term_id, week: weekIndex + 1,
    status: (index * 11 + weekIndex * 7) % 13 === 0 ? "absent" as const : "present" as const,
    notes: (index * 11 + weekIndex * 7) % 13 === 0 ? "Sample absence" : null,
  })));
  await prisma.attendance.createMany({ data: attendanceRows });

  await prisma.payment.createMany({
    data: enrolments.map((enrolment, index) => {
      const amountDue =
        classBlueprints.find(
          (_, classIndex) => classes[classIndex]!.class_id === enrolment.class_id,
        )?.[1] === "OC"
          ? 320
          : 300;
      const amountPaid = amountDue;

      return {
        enrolment_id: enrolment.enrolment_id,
        amount_due: amountDue,
        amount_paid: amountPaid,
        payment_date: dateInWeek(currentTerm.start_date, (index % 6) + 1),
        payment_type:
          index % 3 === 0 ? "cash" : index % 3 === 1 ? "bank_transfer" : "other",
        status: "paid",
        receipt: `${Math.floor(100000 + Math.random() * 900000)}`,
        notes: null,
      };
    }),
  });

  console.log(`Seeded ${students.length} students, ${parents.length} parents, ${classes.length} classes, ${enrolments.length} enrolments, ${attendanceRows.length} attendance records, and ${enrolments.length} payments.`);
}

const cleanupOnly = process.argv.includes("--clean");
(cleanupOnly ? cleanSampleData() : seedSampleData())
  .then(() => console.log(cleanupOnly ? "Sample data removed." : "Sample data seed complete."))
  .catch((error) => { console.error("Sample data operation failed:", error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
