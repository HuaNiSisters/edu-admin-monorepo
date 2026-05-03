"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAsync } from "@/hooks/use-async";
import { classService, termService } from "@/lib/services";
import { ClassTimeWithSubjectAndTutor, Term } from "@/lib/api/types";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import AttendanceTable from "../_components/attendance-table";
import { SelectTerm } from "@/components/_reusable-form-components/select-term";
import { LoadingBar } from "@/components/loading-bar";

const ViewClassAttendance = () => {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassTimeWithSubjectAndTutor>();
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [terms, setTerms] = useState<Term[]>([]);

  const { run, isPending } = useAsync();

  // Fetch class and terms on mount
  useEffect(() => {
    run(async () => {
      const [selectedClass, allTerms] = await Promise.all([
        classService.getClassByIdAsync(classId),
        termService.getTermsAsync(),
      ]);
      setClassData(selectedClass);
      setTerms(allTerms);
      const currentTerm = allTerms.find((t) => {
        const now = new Date();
        return new Date(t.start_date) <= now && now <= new Date(t.end_date);
      });
      const defaultTerm = currentTerm ?? allTerms[0];
      if (defaultTerm) setSelectedTermId(defaultTerm.term_id);
    });
  }, [classId, run]);

  const selectedTerm = terms.find((t) => t.term_id === selectedTermId);

  return (
    <div className="space-y-4">
      <div>
        <LoadingBar isLoading={isPending} />

        <h1 className="text-2xl font-bold text-gray-900">
          {classData?.subject_name
            ? `${classData.subject_name} - Grade ${classData.grade} ${classData.day_of_week} ${classData.start_time} –
              ${classData.end_time} (${formatValuesRemoveUnderscores(classData?.location ?? "")})`
            : "Class Attendance"}
        </h1>
        {classData && (
          <p className="mt-1 text-sm text-gray-500 space-x-3">
            {classData.tutor && <span>{classData.tutor}</span>}
          </p>
        )}
      </div>
      <SelectTerm
        value={selectedTermId}
        onChange={(termData) => {
          if (termData.term_id) setSelectedTermId(termData.term_id);
        }}
        disabled={isPending}
      />

      <AttendanceTable classData={classData} term={selectedTerm} />
    </div>
  );
};

export default ViewClassAttendance;
