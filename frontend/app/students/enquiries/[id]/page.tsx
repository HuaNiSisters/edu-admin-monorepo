"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/loading-bar";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";
import EnquiryForm, { enquiryToFormValues } from "../_components/enquiry-form";

export default function EnquiryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    enquiryService.getById(id).then(data => {
      if (!cancelled) setEnquiry(data);
    }).catch(err => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load enquiry.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  async function save(values: Parameters<typeof enquiryService.update>[1]) {
    await enquiryService.update(id, values);
    toast.success("Enquiry updated");
    router.push("/students/enquiries");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <LoadingBar isLoading={loading} />
      <div>
        <Button variant="ghost" size="sm" className="mb-3 -ml-3" asChild>
          <Link href="/students/enquiries"><ArrowLeft className="mr-2 size-4" />Back to enquiries</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Edit Enquiry</h1>
        {enquiry && <p className="mt-1 text-sm text-muted-foreground">
          Created {new Date(enquiry.created_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} by {enquiry.created_by}
        </p>}
      </div>
      {loading && <p role="status">Loading enquiry…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {enquiry && <EnquiryForm key={enquiry.enquiry_id} initialValues={enquiryToFormValues(enquiry)} onSubmit={save} />}
    </div>
  );
}
