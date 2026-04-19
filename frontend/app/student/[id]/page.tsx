"use client";

import { useEffect, useState } from "react";
import { StudentWithParents } from "@/lib/api/types";
import { studentService } from "@/lib/services";
import StudentDataForm from "@/components/_reusable-form-components/student-data-form";
import { useParams } from "next/navigation";
import { useAsync } from "@/hooks/use-async";

export default function ViewStudentPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [studentData, setStudentData] = useState<StudentWithParents>();
  const { run, isPending } = useAsync();

  const fetchStudentData = async () => {
    const data = await studentService.getStudentByIdAsync(studentId);
    console.log({ fetchedStudentData: data });
    setStudentData(data);
  };

  useEffect(() => {
    run(fetchStudentData);
  }, [params.id]);

  return (
    <div>
      {isPending && <div></div>}
      {!isPending && studentData && <StudentDataForm studentData={studentData} isEditing={false} />}
    </div>
  );
}
