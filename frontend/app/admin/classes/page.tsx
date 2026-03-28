"use client";

import { useState, useEffect, useCallback } from "react";
import { useAsync } from "@/hooks/use-async";
import ClassesList from "./_components/classes-list";
import ClassDialog from "./_components/class-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClassTimeWithSubject, SubjectOffering } from "@/types/IApiWrapper";
import { LoadingBar } from "@/components/loading-bar";
import apiWrapper from "@/lib/apiWrapper";

const ClassesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassTimeWithSubject | null>(
    null,
  );
  const [classes, setClasses] = useState<ClassTimeWithSubject[]>([]);
  const [subjectOfferings, setSubjectOfferings] = useState<SubjectOffering[]>(
    [],
  );
  const { run, isPending } = useAsync();

  const fetchClasses = useCallback(() => {
    run(async () => {
      const data = await apiWrapper.getClassTimesAsync();
      setClasses(data);
    });
  }, [run]);

  useEffect(() => {
    async function fetchSubjects() {
      const fetchedSubjects = await apiWrapper.getSubjectOfferingsAsync();
      setSubjectOfferings(fetchedSubjects);
    }
    fetchSubjects();
    fetchClasses();
  }, [fetchClasses]);

  const handleAdd = () => {
    setEditingClass(null);
    setDialogOpen(true);
  };

  const handleEdit = (classTime: ClassTimeWithSubject) => {
    setEditingClass(classTime);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    offering_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number | null;
    active: boolean;
  }) => {
    if (editingClass) {
      await apiWrapper.updateClassAsync(editingClass.class_id, data);
    } else {
      await apiWrapper.createClassAsync(data);
    }
    setDialogOpen(false);
    fetchClasses();
  };

  return (
    <div className="gap-y-4">
      <LoadingBar isLoading={isPending} />

      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Add Class
        </Button>
      </div>

      <ClassesList classes={classes} onEdit={handleEdit} />

      <ClassDialog
        key={editingClass?.class_id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classTime={editingClass}
        subjectOfferings={subjectOfferings}
        onSave={handleSave}
      />
    </div>
  );
};

export default ClassesPage;
