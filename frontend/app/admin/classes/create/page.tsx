import type { Metadata } from "next";
import ClassDataForm from "@/components/_reusable-form-components/class-data-form";

export const metadata: Metadata = {
  title: "Create class",
};

const CreateClassPage = () => {
  return (
    <div className="flex justify-center">
      <ClassDataForm />
    </div>
  );
};

export default CreateClassPage;
