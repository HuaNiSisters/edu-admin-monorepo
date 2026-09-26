"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingBar } from "@/components/loading-bar";
import { useAsync } from "@/hooks/use-async";
import { StudentOwing } from "@/lib/api/types/owing";
import { paymentService } from "@/lib/services";
import OwingsList from "./_components/owings-list";

export default function OwingsPage() {
  const [owings, setOwings] = useState<StudentOwing[]>([]);
  const { run, isPending } = useAsync();

  const fetchOwings = useCallback(() => {
    run(async () => setOwings(await paymentService.getStudentOwingsAsync()));
  }, [run]);

  useEffect(() => {
    fetchOwings();
  }, [fetchOwings]);

  return (
    <div className="space-y-4">
      <LoadingBar isLoading={isPending} />
      <div>
        <h1 className="text-2xl font-semibold">Owings</h1>
      </div>
      <OwingsList owings={owings} />
    </div>
  );
}
