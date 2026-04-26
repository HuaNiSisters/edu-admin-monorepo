"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAsync } from "@/hooks/use-async";
import { classService } from "@/lib/services";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";

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

  return <div>{classData?.subject_name}</div>;
};

export default ViewClassAttendance;
