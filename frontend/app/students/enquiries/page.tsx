"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/loading-bar";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";
import EnquiriesList from "./_components/enquiries-list";
import EnquiryDialog from "./_components/enquiry-dialog";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEnquiries(await enquiryService.list());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEnquiries(); }, [loadEnquiries]);

  return (
    <div className="min-w-0 space-y-4">
      <LoadingBar isLoading={loading} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />New enquiry
        </Button>
      </div>
      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadEnquiries()}>Retry</Button>
        </div>
      )}
      <EnquiriesList enquiries={enquiries} />
      <EnquiryDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={enquiry => {
        setEnquiries(current => [enquiry, ...current]);
        toast.success("Enquiry created");
      }} />
    </div>
  );
}
