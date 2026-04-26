"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAsync } from "@/hooks/use-async";
import { classService } from "@/lib/services";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { start } from "repl";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const ViewClassAttendance = () => {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassTimeWithSubjectAndTutor>();

  const { run, isPending } = useAsync();

  const fetchClassData = async () => {
    const data = await classService.getClassByIdAsync(classId);
    console.log({ fetchedClassData: data });
    setClassData(data);
  };

  useEffect(() => {
    run(fetchClassData);
  }, [params.id, run]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isPending && !classData
            ? "Loading…"
            : classData?.subject_name
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
    </>
  );
};

export default ViewClassAttendance;
