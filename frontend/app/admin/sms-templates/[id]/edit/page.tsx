"use client";
import { Suspense } from "react";
import { SMSAction } from "@/types/smsActions";
import { useParams } from "next/navigation";
import SMSTemplateData from "../../_components/sms-template-data";

export default function UpdateSMSTemplatePage() {
  return (
    <Suspense fallback={<div role="status">Loading SMS template...</div>}>
      <UpdateSMSTemplateContent />
    </Suspense>
  );
}

function UpdateSMSTemplateContent() {
  const params = useParams();
  const templateId = params.id as string;

  return (
    <div>
      <div className="flex justify-between">
        <b style={{ fontSize: "22px" }}>Update SMS template</b>
        {/* <Button onClick={() => router.push(`/admin/sms-templates/${templateId}`)}>Done</Button> */}
      </div>
      <SMSTemplateData
        templateId={templateId}
        smsAction={SMSAction.Owings}
        isEditing={true}
      />
    </div>
  );
}
