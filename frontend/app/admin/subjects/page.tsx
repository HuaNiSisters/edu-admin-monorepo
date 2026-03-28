"use client";

import { useState, useEffect, useCallback } from "react";
import { useAsync } from "@/hooks/use-async";
import SubjectsList from "./_components/subjects-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubjectOffering } from "@/types/IApiWrapper";
import SubjectDialog from "./_components/subject-dialog";
import { Label } from "@/components/ui/label";
import apiWrapper from "@/lib/apiWrapper";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";
import { LoadingBar } from "@/components/loading-bar";

const SubjectsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOffering | null>(
    null,
  );

  const [subjectOfferings, setSubjectOfferings] = useState<SubjectOffering[]>(
    [],
  );
  const { run, isPending } = useAsync();

  const fetchSubjects = useCallback(() => {
    run(async () => {
      const data = await apiWrapper.getSubjectOfferingsAsync();
      setSubjectOfferings(data);
    });
  }, [run]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAdd = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleSave = (data: {
    subjectName: string;
    grade: string;
    pricePerTerm: string;
    location: string;
  }) => {
    console.log("Save subject:", data);
    setDialogOpen(false);
    fetchSubjects();
  };

  const handleEdit = (subject: SubjectOffering) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  return (
    <div className="gap-y-4">
      <LoadingBar isLoading={isPending} />

      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>

      <SubjectsList subjectOfferings={subjectOfferings} onEdit={handleEdit} />

      <SubjectDialog
        key={editingSubject?.subject_id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editingSubject}
        onSave={(data) => handleSave({ ...data })}
      />
    </div>
  );
};

export default SubjectsPage;
