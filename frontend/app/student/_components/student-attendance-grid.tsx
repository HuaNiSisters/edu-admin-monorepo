"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Attendance, EnrolmentWithClassAndTerm, Term } from "@/lib/api/types";
import { classService } from "@/lib/services";

type AttendanceStatus = "present" | "absent" | null;

type WeekInfo = {
  week: number;
  lessonDate: Date;
  weekStart: Date;
  weekEnd: Date;
  isCurrentWeek: boolean;
};

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function generateWeeks(
  termStart: string,
  termEnd: string,
  classDay: string,
  today: Date = new Date(),
) {
  const result: WeekInfo[] = [];

  const start = new Date(termStart);
  const end = new Date(termEnd);
  const targetDay = DAY_MAP[classDay.toLowerCase()];

  const firstClass = new Date(start);
  while (firstClass.getDay() !== targetDay) {
    firstClass.setDate(firstClass.getDate() + 1);
  }
  if (firstClass < start) {
    firstClass.setDate(firstClass.getDate() + 7);
  }

  const current = new Date(firstClass);
  let week = 1;

  while (current <= end) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekStart > end) break;

    const isCurrentWeek = today >= weekStart && today <= weekEnd;

    result.push({
      week,
      lessonDate: new Date(weekStart),
      weekStart,
      weekEnd,
      isCurrentWeek,
    });

    current.setDate(current.getDate() + 7);
    week++;
  }

  return result;
}

type StudentAttendanceGridProps = {
  studentId: string;
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
  attendanceRecords: Attendance[];
};

const StudentAttendanceGrid = ({
  studentId,
  term,
  enrolments,
  attendanceRecords,
}: StudentAttendanceGridProps) => {
  const [records, setRecords] = useState<Attendance[]>(attendanceRecords);

  useEffect(() => {
    setRecords(attendanceRecords);
  }, [attendanceRecords]);

  const maxWeekCount = Math.max(
    ...enrolments.map(
      (enrolment) =>
        generateWeeks(
          term.start_date,
          term.end_date,
          enrolment.ClassTime.day_of_week,
        ).length,
    ),
    0,
  );
  const weekNumbers = Array.from({ length: maxWeekCount }, (_, i) => i + 1);

  const handleToggle = useCallback(
    async (enrolment: EnrolmentWithClassAndTerm, week: number) => {
      const existing = records.find(
        (record) =>
          record.class_id === enrolment.class_id && record.week === week,
      );
      const newStatus: AttendanceStatus =
        existing?.status === "present" ? "absent" : "present";

      setRecords((prev) => {
        const withoutThisRecord = prev.filter(
          (record) =>
            !(record.class_id === enrolment.class_id && record.week === week),
        );
        return [
          ...withoutThisRecord,
          {
            ...(existing ?? {
              attendance_id: `${enrolment.class_id}-${week}`,
              student_id: studentId,
              class_id: enrolment.class_id,
              term_id: term.term_id,
              week,
              notes: null,
            }),
            status: newStatus,
          } as Attendance,
        ];
      });

      await classService.updateStudentAttendanceInClassAndTermPerWeekAsync(
        studentId,
        enrolment.class_id,
        term.term_id,
        week,
        newStatus,
      );
    },
    [records, studentId, term.term_id],
  );

  if (enrolments.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No attendance records found for this term.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Class</TableHead>
            {weekNumbers.map((week) => (
              <TableHead key={week} className="text-center">
                Week {week}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrolments.map((enrolment) => {
            const classWeeks = generateWeeks(
              term.start_date,
              term.end_date,
              enrolment.ClassTime.day_of_week,
            );

            return (
              <TableRow key={enrolment.enrolment_id}>
                <TableCell className="py-3">
                  <div className="font-medium">
                    {enrolment.ClassTime.SubjectOffering.subject_name}{" "}
                    {enrolment.ClassTime.SubjectOffering.grade
                      ? `Y${enrolment.ClassTime.SubjectOffering.grade}`
                      : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {enrolment.ClassTime.day_of_week}{" "}
                    {enrolment.ClassTime.start_time}
                  </div>
                </TableCell>

                {weekNumbers.map((week) => {
                  const weekInfo = classWeeks.find((w) => w.week === week);
                  if (!weekInfo) {
                    return <TableCell key={week} />;
                  }

                  const record = records.find(
                    (r) => r.class_id === enrolment.class_id && r.week === week,
                  );

                  return (
                    <TableCell key={week} className="text-center">
                      <div className="text-xs italic text-muted-foreground mb-1">
                        {weekInfo.lessonDate.toLocaleDateString("en-AU", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                      <Checkbox
                        checked={record?.status === "present"}
                        onCheckedChange={() => handleToggle(enrolment, week)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentAttendanceGrid;
