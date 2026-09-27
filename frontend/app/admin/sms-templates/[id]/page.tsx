"use client";
import { SMSAction } from "@/types/smsActions";
import { useParams, useRouter } from "next/navigation";
import SMSTemplateData from "../_components/sms-template-data";
import { Button } from "@/components/ui/button";

export default function ViewSMSTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;

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
