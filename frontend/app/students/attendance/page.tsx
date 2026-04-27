"use client";

import ClassesList from "@/app/admin/classes/_components/classes-list";
import React, { useState, useEffect, useCallback } from "react";
import { useAsync } from "@/hooks/use-async";
import { classService } from "@/lib/services";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { LoadingBar } from "@/components/loading-bar";

const AttendancePage = () => {
  const { run, isPending } = useAsync();
  const [classes, setClasses] = useState<ClassTimeWithSubjectAndTutor[]>([]);

  const fetchClasses = useCallback(() => {
    run(async () => {
      const data = await classService.getClassTimesAsync();
      setClasses(data);
    });
  }, [run]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <div>
      {/* TODO: have it so that tutor users has the tutors filter disabled and pre-selected to them */}
      <LoadingBar isLoading={isPending} />
      <ClassesList classes={classes} />
    </div>
  );
};

export default AttendancePage;
