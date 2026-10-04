import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Enquiry } from "@/lib/api/types/enquiry";
import EnquiriesList from "./_components/enquiries-list";

// No enquiry API exists yet. Keep the list empty until it is connected.
const enquiries: Enquiry[] = [];

export default function EnquiriesPage() {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <Button disabled className="gap-2">
          <Plus className="size-4" />
          New enquiry
        </Button>
      </div>
      <EnquiriesList enquiries={enquiries} />
    </div>
  );
}
