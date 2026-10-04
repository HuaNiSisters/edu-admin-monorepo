"use client";

import ClassesList from "@/app/admin/classes/_components/classes-list";
import React, { useState, useEffect, useCallback } from "react";
import { useAsync } from "@/hooks/use-async";
import { classService } from "@/lib/services";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { LoadingBar } from "@/components/loading-bar";
import { Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/core/userRoles/types";
import { createClient } from "@/lib/api/supabase/client";

const AttendancePage = () => {
  const { run, isPending } = useAsync();
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<ClassTimeWithSubjectAndTutor[]>([]);
  const [tutorName, setTutorName] = useState<string | null>(null);
  const isTutor = currentUser?.app_metadata?.role === UserRole.Tutor;
  const userId = currentUser?.id;

  const fetchClasses = useCallback(() => {
    run(async () => {
      setClasses([]);
      setTutorName(null);
      let resolvedTutorName: string | null = null;

      if (isTutor && userId) {
        const supabase = createClient();
        const { data: tutor, error } = await supabase
          .from("Tutor")
          .select("first_name, last_name")
          .eq("auth_user_id", userId)
          .maybeSingle();

        if (error) {
          throw new Error(`Failed to load tutor profile: ${error.message}`);
        }
        resolvedTutorName =
          tutor ? `${tutor.first_name} ${tutor.last_name}`.trim() : null;
      }

      const data = await classService.getClassTimesAsync();
      setTutorName(resolvedTutorName);
      setClasses(data);
    });
  }, [isTutor, run, userId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <Suspense fallback={<span>...</span>}>
      <div>
        <LoadingBar isLoading={isPending} />
        <ClassesList
          classes={classes}
          isTutor={isTutor}
          tutorName={tutorName}
        />
      </div>
    </Suspense>
  );
};

export default AttendancePage;
