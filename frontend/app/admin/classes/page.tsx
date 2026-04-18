"use client";

import { useState, useEffect, useCallback } from "react";
import { useAsync } from "@/hooks/use-async";
import ClassesList from "./_components/classes-list";
import ClassDialog from "./_components/class-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  ClassTimeWithSubjectAndTutor,
  EmployeeInfo,
  SubjectOffering,
} from "@/types/IApiWrapper";
import { LoadingBar } from "@/components/loading-bar";
import apiWrapper from "@/lib/apiWrapper";

const ClassesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] =
    useState<ClassTimeWithSubjectAndTutor | null>(null);
  const [classes, setClasses] = useState<ClassTimeWithSubjectAndTutor[]>([]);
  const [subjectOfferings, setSubjectOfferings] = useState<SubjectOffering[]>(
    [],
  );
  const [tutors, setTutors] = useState<EmployeeInfo[]>([]);

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
    async function fetchTutors() {
      const fetchedTutors = await apiWrapper.getTutorsAsync();
      setTutors(fetchedTutors);
    }

    fetchSubjects();
    fetchTutors();
    fetchClasses();
  }, [fetchClasses]);

  const handleAdd = () => {
    setEditingClass(null);
    setDialogOpen(true);
  };

  const handleEdit = (classTime: ClassTimeWithSubjectAndTutor) => {
    setEditingClass(classTime);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    offering_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    tutor: string | null;
    capacity: number | null;
    active: boolean;
  }) => {
    console.log("Save class:", data);
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
        tutors={tutors}
        onSave={handleSave}
      />
    </div>
  );
};

export default ClassesPage;
