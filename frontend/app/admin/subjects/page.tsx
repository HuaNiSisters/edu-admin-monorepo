"use client";

import { useState } from "react";
import SubjectsList from "./_components/subjects-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubjectOffering } from "@/types/IApiWrapper";
import SubjectDialog from "./_components/subject-dialog";

const CreateSubjectPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOffering | null>(
    null,
  );

  const handleAdd = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleSave = () => {};

  return (
    <div className="gap-y-2">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>
      <div>
        <SubjectsList />
      </div>

      <SubjectDialog
        key={editingSubject?.grade_id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editingSubject}
        onSave={handleSave}
      />
    </div>
  );
};

export default CreateSubjectPage;
