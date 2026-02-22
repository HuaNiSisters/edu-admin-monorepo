import type { Metadata } from "next";
import StudentDataForm from "@/components/_reusable-form-components/student-data-form";

export const metadata: Metadata = {
  title: "Create student",
};

const CreateStudentPage = () => {
  return (
    <div className="flex justify-center">
      <StudentDataForm />
    </div>
  );
};

export default CreateStudentPage;
