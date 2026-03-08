"use client";

import { SubjectOffering } from "@/types/IApiWrapper";
import { DataTable } from "@/components/ui/data-table";
import { createSubjectColumns } from "./columns";

type SubjectsListProps = {
  locationFilter: string;
  subjectOfferings: SubjectOffering[];
  onEdit: (subject: SubjectOffering) => void;
};

const SubjectsList = ({ subjectOfferings, onEdit }: SubjectsListProps) => {
  const columns = createSubjectColumns(onEdit);

  return <DataTable columns={columns} data={subjectOfferings} />;
};

export default SubjectsList;
