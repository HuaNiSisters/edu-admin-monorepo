"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, UserPlus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";
import { createEnquiryColumns } from "./enquiries-columns";

type EnquiryView = "open" | "closed";

export default function EnquiriesList({
  enquiries,
  onEnquiriesChanged,
}: {
  enquiries: Enquiry[];
  onEnquiriesChanged: () => Promise<void>;
}) {
  const router = useRouter();
  const [view, setView] = useState<EnquiryView>("open");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const displayedEnquiries = useMemo(
    () => enquiries.filter(enquiry => view === "closed" ? enquiry.is_closed : !enquiry.is_closed),
    [enquiries, view],
  );
  const columns = useMemo(() => createEnquiryColumns({
    selectedIds,
    onSelectionChange: (id, selected) => setSelectedIds(current => {
      const next = new Set(current);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    }),
  }), [selectedIds]);

  async function updateSelectedStatus() {
    if (selectedIds.size === 0) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      if (view === "open") {
        await enquiryService.close([...selectedIds]);
      } else {
        await enquiryService.reopen([...selectedIds]);
      }
      setSelectedIds(new Set());
      await onEnquiriesChanged();
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Unable to update enquiries.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="min-w-0 space-y-3 [contain:inline-size]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={value => {
            if (!value) return;
            setView(value as EnquiryView);
            setSelectedIds(new Set());
          }}
          variant="outline"
        >
          <ToggleGroupItem value="open">Open</ToggleGroupItem>
          <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button size="sm" onClick={() => void updateSelectedStatus()} disabled={isUpdatingStatus}>
              {view === "open" ? <CheckCircle2 className="mr-2 size-4" /> : <RotateCcw className="mr-2 size-4" />}
              {isUpdatingStatus
                ? view === "open" ? "Closing…" : "Reopening…"
                : view === "open" ? `Close ${selectedIds.size} selected` : `Reopen ${selectedIds.size} selected`}
            </Button>
          )}
          {view === "closed" && selectedIds.size === 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/students/create?enquiryId=${[...selectedIds][0]}`)}
            >
              <UserPlus className="mr-2 size-4" />Create student
            </Button>
          )}
        <span className="text-sm text-muted-foreground">
          {displayedEnquiries.length} enquiries
        </span>
        </div>
      </div>
      {statusError && <p role="alert" className="text-sm text-destructive">{statusError}</p>}
      <DataTable columns={columns} data={displayedEnquiries} />
    </div>
  );
}
