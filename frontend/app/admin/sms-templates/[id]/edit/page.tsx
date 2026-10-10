"use client";
import { Suspense, use } from "react";
import { SMSAction } from "@/types/smsActions";
import SMSTemplateData from "../../_components/sms-template-data";

type SMSTemplatePageProps = {
  params: Promise<{ id: string }>;
};

export default function UpdateSMSTemplatePage({ params }: SMSTemplatePageProps) {
  return (
    <Suspense fallback={<div role="status">Loading SMS template...</div>}>
      <UpdateSMSTemplateContent params={params} />
    </Suspense>
  );
}

function UpdateSMSTemplateContent({ params }: SMSTemplatePageProps) {
  const { id: templateId } = use(params);

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
