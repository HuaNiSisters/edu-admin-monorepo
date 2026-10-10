"use client";
import { Suspense, use } from "react";
import { SMSAction } from "@/types/smsActions";
import { useRouter } from "next/navigation";
import SMSTemplateData from "../_components/sms-template-data";
import { Button } from "@/components/ui/button";

type SMSTemplatePageProps = {
  params: Promise<{ id: string }>;
};

export default function ViewSMSTemplatePage({ params }: SMSTemplatePageProps) {
  return (
    <Suspense fallback={<div role="status">Loading SMS template...</div>}>
      <ViewSMSTemplateContent params={params} />
    </Suspense>
  );
}

function ViewSMSTemplateContent({ params }: SMSTemplatePageProps) {
  const { id: templateId } = use(params);

  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between">
        <b style={{ fontSize: "22px" }}>SMS template</b>
        <Button onClick={() => router.push(`/admin/sms-templates/${templateId}/edit`)}>Edit</Button>
      </div>
      <SMSTemplateData
        templateId={templateId}
        smsAction={SMSAction.Owings}
        isEditing={false}
      />
    </div>
  );
}
