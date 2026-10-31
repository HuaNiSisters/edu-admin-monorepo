"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Enquiry } from "@/lib/api/types/enquiry";
import EnquiryForm from "./enquiry-form";
import { enquiryService } from "@/lib/services/enquiryService";

export default function EnquiryDialog({ open, onOpenChange, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (enquiry: Enquiry) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>New Enquiry</DialogTitle></DialogHeader>
        <EnquiryForm key={open ? "open" : "closed"} submitLabel="Create Enquiry" onSubmit={async values => {
          const enquiry = await enquiryService.create(values);
          onSave(enquiry);
          onOpenChange(false);
        }} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
