"use client";

import { useEffect, useState } from "react";
import { StudentData } from "@/types/IApiWrapper";
import StudentDataForm from "@/components/_reusable-form-components/student-data-form";
import apiWrapper from "@/lib/apiWrapper";
import { useParams } from "next/navigation";

export default function StudentUpdatePage() {
  const params = useParams();
  const studentId = params.id as string;

  const [studentData, setStudentData] = useState<StudentData>();

  const fetchStudentData = async () => {
    const data = await apiWrapper.getStudentByIdAsync(studentId);
    console.log({ fetchedStudentData: data });
    setStudentData(data);
  };

  useEffect(() => {
    fetchStudentData();
  }, [params.id]);

  return (
    <div>
      <StudentDataForm studentData={studentData} isEditing={true} />
    </div>
  );
}
