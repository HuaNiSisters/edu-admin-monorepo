"use client";

import { Suspense, use, useEffect, useState } from "react";
import { StudentWithParents } from "@/lib/api/types";
import { studentService } from "@/lib/services";
import StudentDataForm from "@/components/_reusable-form-components/student-data-form";
import { useAsync } from "@/hooks/use-async";
import EnrolledClasses from "../_components/enrolled-classes";

type StudentPageProps = {
  params: Promise<{ id: string }>;
};

export default function ViewStudentPage({ params }: StudentPageProps) {
  return (
    <Suspense fallback={<div role="status">Loading student...</div>}>
      <ViewStudentContent params={params} />
    </Suspense>
  );
}

function ViewStudentContent({ params }: StudentPageProps) {
  const { id: studentId } = use(params);

  const [studentData, setStudentData] = useState<StudentWithParents>();
  const { run, isPending } = useAsync();

  useEffect(() => {
    run(async () => {
      const data = await studentService.getStudentByIdAsync(studentId);
      setStudentData(data);
    });
  }, [studentId, run]);

  return (
    <div>
      {isPending && <div></div>}
      {!isPending && studentData && (
        <div>
          <StudentDataForm studentData={studentData} isEditing={false} />
          <br />
          <EnrolledClasses studentId={studentId} />
        </div>
      )}
    </div>
  );
}
