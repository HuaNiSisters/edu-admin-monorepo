"use client";
import { SMSAction } from "@/types/smsActions";
import SMSTemplateData from "../../_components/sms-template-data";

export default function UpdateSMSTemplatePage() {
  return (
    <div>
      <div className="flex justify-between">
        <b style={{ fontSize: "22px" }}>Update SMS template</b>
        {/* <Button onClick={() => router.push(`/admin/sms-templates/${templateId}`)}>Done</Button> */}
      </div>
      <SMSTemplateData smsAction={SMSAction.Owings} isEditing={true} />
    </div>
  );
}
