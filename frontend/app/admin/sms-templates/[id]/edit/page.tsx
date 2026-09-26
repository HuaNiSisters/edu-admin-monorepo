"use client";
import { SMSAction } from "@/types/smsActions";
import { useParams } from "next/navigation";
import SMSTemplateData from "../../_components/sms-template-data";

export default function UpdateSMSTemplatePage() {
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
