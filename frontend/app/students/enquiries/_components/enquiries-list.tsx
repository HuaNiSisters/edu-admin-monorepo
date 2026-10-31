"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";
import { createEnquiryColumns } from "./enquiries-columns";

type EnquiryView = "open" | "closed" | "all";

export default function EnquiriesList({
  enquiries,
  onEnquiriesChanged,
}: {
  enquiries: Enquiry[];
  onEnquiriesChanged: () => Promise<void>;
}) {
  const [view, setView] = useState<EnquiryView>("open");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const displayedEnquiries = useMemo(
    () => enquiries.filter(enquiry => view === "all" || (view === "closed" ? enquiry.is_closed : !enquiry.is_closed)),
    [enquiries, view],
  );
  const selectedOpenIds = useMemo(
    () => [...selectedIds].filter(id => enquiries.some(enquiry => enquiry.enquiry_id === id && !enquiry.is_closed)),
    [enquiries, selectedIds],
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

  async function closeSelected() {
    if (selectedOpenIds.length === 0) return;
    setIsClosing(true);
    setCloseError(null);
    try {
      await enquiryService.close(selectedOpenIds);
      setSelectedIds(new Set());
      await onEnquiriesChanged();
    } catch (error) {
      setCloseError(error instanceof Error ? error.message : "Unable to close enquiries.");
    } finally {
      setIsClosing(false);
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
          <ToggleGroupItem value="all">All</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-3">
          {selectedOpenIds.length > 0 && (
            <Button size="sm" onClick={() => void closeSelected()} disabled={isClosing}>
              <CheckCircle2 className="mr-2 size-4" />
              {isClosing ? "Closing…" : `Close ${selectedOpenIds.length} selected`}
            </Button>
          )}
        <span className="text-sm text-muted-foreground">
          {displayedEnquiries.length} enquiries
        </span>
        </div>
      </div>
      {closeError && <p role="alert" className="text-sm text-destructive">{closeError}</p>}
      <DataTable columns={columns} data={displayedEnquiries} />
    </div>
  );
}
