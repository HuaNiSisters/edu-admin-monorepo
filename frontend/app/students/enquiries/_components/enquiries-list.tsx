"use client";

import { DataTable } from "@/components/ui/data-table";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryColumns } from "./enquiries-columns";

export default function EnquiriesList({ enquiries }: { enquiries: Enquiry[] }) {
  return (
    <div className="min-w-0 space-y-3 [contain:inline-size]">
      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground">
          {enquiries.length} total enquiries
        </span>
      </div>
      <DataTable columns={enquiryColumns} data={enquiries} />
    </div>
  );
}
