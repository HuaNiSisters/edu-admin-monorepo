"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/loading-bar";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";
import EnquiriesList from "@/app/students/enquiries/_components/enquiries-list";
import EnquiryDialog from "@/app/students/enquiries/_components/enquiry-dialog";

export default function Home() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEnquiries(await enquiryService.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEnquiries(); }, [loadEnquiries]);

  return (
    <main className="min-w-0 space-y-4">
      <LoadingBar isLoading={loading} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Latest Enquiries</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadEnquiries()} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />New enquiry
          </Button>
        </div>
      </div>
      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadEnquiries()}>Retry</Button>
        </div>
      )}
      <EnquiriesList enquiries={enquiries} onEnquiriesChanged={loadEnquiries} />
      <EnquiryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={enquiry => {
          setEnquiries(current => [enquiry, ...current]);
          toast.success("Enquiry created");
        }}
      />
    </main>
  );
}
