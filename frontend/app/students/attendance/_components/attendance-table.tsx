"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ClassTimeWithSubjectAndTutor,
  Term,
  Attendance,
} from "@/lib/api/types";
import { useAsync } from "@/hooks/use-async";
import { classService, studentService } from "@/lib/services";

export type AttendanceStatus = "present" | "absent" | null;

type StudentAttendanceRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  attendanceRecords: Attendance[];
};

export interface AttendanceUpsert {
  student_id: string;
  class_id: string;
  term_id: string;
  week: number;
  status: AttendanceStatus;
}

interface AttendanceTableProps {
  classData: ClassTimeWithSubjectAndTutor | undefined;
  term: Partial<Term> | undefined;
}

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

  // 1. find FIRST valid class date inside term
  const firstClass = new Date(start);

  while (firstClass.getDay() !== targetDay) {
    firstClass.setDate(firstClass.getDate() + 1);
  }

  // IMPORTANT FIX: ensure it's inside term range
  if (firstClass < start) {
    firstClass.setDate(firstClass.getDate() + 7);
  }

  const current = new Date(firstClass);
  let week = 1;

  // 2. STRICT boundary check (this is the fix)
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

const AttendanceTable = ({ classData, term }: AttendanceTableProps) => {
  const { run, isPending } = useAsync();
  const [studentAndAttendanceMap, setStudentAndAttendanceMap] = useState<
    StudentAttendanceRow[]
  >([]);

  // Fetch enrolments + attendance when term changes
  useEffect(() => {
    if (!term || !classData) return;

    run(async () => {
      const enrolments = await Promise.all([
        await classService.getEnrolmentsByClassIdAsync(
          classData?.class_id || "",
        ),
      ]);

      const studentAndAttendanceMap: StudentAttendanceRow[] = [];

      for (const enrolment of enrolments[0]) {
        const [student, attendanceRecords] = await Promise.all([
          studentService.getStudentByIdAsync(enrolment.student_id),
          classService.getAttendanceByStudentAndClassAndTermAsync(
            enrolment.student_id,
            classData?.class_id || "",
            term?.term_id || "",
          ),
        ]);

        studentAndAttendanceMap.push({
          studentId: student.student_id,
          firstName: student.first_name,
          lastName: student.last_name,
          gender: student.gender,
          attendanceRecords,
        });
      }

      console.log("studentAndAttendanceMap", studentAndAttendanceMap);
      setStudentAndAttendanceMap(() => {
        const newMap = [...studentAndAttendanceMap];
        return newMap.filter(
          (student, index, self) =>
            index === self.findIndex((s) => s.studentId === student.studentId),
        );
      });
    });
  }, [term, classData, run]);

  const weeks =
    term && classData
      ? generateWeeks(
          term.start_date ?? "",
          term.end_date ?? "",
          classData.day_of_week,
        )
      : [];

  const handleToggle = useCallback(
    async (studentId: string, week: number) => {
      if (!classData || !term) return;

      // Capture BEFORE state changes
      const student = studentAndAttendanceMap.find(
        (s) => s.studentId === studentId,
      );
      const record = student?.attendanceRecords.find(
        (r) => Number(r.week) === Number(week),
      );

      const newStatus: AttendanceStatus =
        record?.status === "present" ? "absent" : "present";

      // Now optimistically update
      setStudentAndAttendanceMap((prev) =>
        prev.map((s) => {
          if (s.studentId !== studentId) return s;
          return {
            ...s,
            attendanceRecords: s.attendanceRecords.map((r) =>
              r.week === week ? { ...r, status: newStatus } : r,
            ),
          };
        }),
      );

      // Use the captured newStatus
      await classService.updateStudentAttendanceInClassAndTermPerWeekAsync(
        studentId,
        classData.class_id,
        term?.term_id || "",
        week,
        newStatus,
      );
    },
    [classData, term, studentAndAttendanceMap],
  );

  return (
    <div className="rounded-md border p-2 bg-primary-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Student</TableHead>
            {weeks.map((w) => (
              <TableHead
                key={w.week}
                className={`text-center ${w.isCurrentWeek ? "font-bold" : ""}`}
              >
                <div>Week {w.week}</div>
                <div className="text-xs text-gray-500">
                  {w.lessonDate.toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentAndAttendanceMap.map((student) => (
            <TableRow key={student.studentId}>
              {/* Student column */}
              <TableCell className="py-3">
                <div>
                  {student.firstName} {student.lastName}
                </div>
              </TableCell>

              {/* Week columns */}
              {weeks.map((w) => {
                const record = student.attendanceRecords.find(
                  (a) => a.week === w.week,
                );

                return (
                  <TableCell key={w.week} className={`text-center`}>
                    <Checkbox
                      checked={record?.status === "present"}
                      onCheckedChange={() => {
                        console.log(
                          "Toggle attendance for studentId:",
                          student.studentId,
                          "week:",
                          w.week,
                          "current status:",
                          record?.status,
                        );
                        handleToggle(student.studentId, w.week);
                      }}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
