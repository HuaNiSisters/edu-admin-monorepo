"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { smsService } from "@/lib/services";
import { actionToSampleContext, SMSAction } from "@/types/smsActions";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SmsTemplateVariableSelector, {
  cloneTemplateContext,
  getContextValue,
  getInvalidTemplateVariables,
  getTemplateVariables,
  type SmsTemplateContext,
} from "./sms-template-variable-selector";

const SMSTemplateData = ({
  templateId,
  smsAction,
  isEditing,
  onSaved,
}: {
  templateId: string;
  smsAction: SMSAction;
  isEditing?: boolean;
  onSaved?: () => void;
}) => {
  const { run } = useAsync();

  const [sampleContext, setSampleContext] = useState<SmsTemplateContext>(() =>
    cloneTemplateContext(actionToSampleContext[smsAction]),
  );
  const [content, setContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [toTestPhoneNumber, setToTestPhoneNumber] = useState("+61420398812");

  const templateVariables = useMemo(
    () => getTemplateVariables(content),
    [content],
  );
  const invalidVariables = useMemo(
    () => getInvalidTemplateVariables(content, sampleContext),
    [content, sampleContext],
  );
  const validationError =
    invalidVariables.length > 0
      ? `The following variables are not valid: ${invalidVariables.join(", ")}`
      : "";

  useEffect(() => {
    setSampleContext(cloneTemplateContext(actionToSampleContext[smsAction]));
    smsService.getSMSTemplateByIdAsync(templateId).then((template) => {
      setTemplateName(template.name);
      setContent(template.content);
    });
  }, [smsAction, templateId]);

  function saveTemplate() {
    run(async () => {
      if (!templateName.trim()) {
        throw new Error("Please provide a template name before saving.");
      }
      if (validationError) {
        throw new Error("Please fix template errors before saving.");
      }

      await smsService.updateSMSTemplateAsync(templateId, {
        name: templateName.trim(),
        content,
      });
      toast.success("Template updated successfully!", {
        position: "top-center",
      });
      onSaved?.();
    });
  }

  function sendTestSMS() {
    const sampleVariables = Object.fromEntries(
      templateVariables.map((variable) => [
        variable,
        String(getContextValue(sampleContext, variable) ?? ""),
      ]),
    );

    run(async () => {
      await smsService.sendSMSTemplateAsync(
        templateId,
        toTestPhoneNumber,
        sampleVariables,
      );
      toast.success("Test SMS sent successfully!", {
        position: "top-center",
      });
    });
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Template name"
        value={templateName}
        onChange={(event) => setTemplateName(event.target.value)}
        disabled={!isEditing}
      />
      <div className="space-y-2">
        <Textarea
          value={content}
          placeholder="Template content e.g. Hi {{student.full_name}}"
          onChange={(event) => setContent(event.target.value)}
          disabled={!isEditing}
          maxLength={1600}
          className="min-h-40"
        />
        {validationError && (
          <p className="text-destructive text-sm" role="alert">
            {validationError}
          </p>
        )}
      </div>

      <SmsTemplateVariableSelector
        content={content}
        context={sampleContext}
        editable={Boolean(isEditing)}
        onContentChange={setContent}
        onContextChange={setSampleContext}
      />

      {isEditing ? (
        <Button
          onClick={saveTemplate}
          disabled={!templateName.trim() || Boolean(validationError)}
        >
          Save template
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="test-phone-number">Send test SMS to:</label>
            <Input
              id="test-phone-number"
              value={toTestPhoneNumber}
              onChange={(event) => setToTestPhoneNumber(event.target.value)}
            />
          </div>
          <Button onClick={sendTestSMS}>Send Test SMS</Button>
        </div>
      )}
    </div>
  );
};

export default SMSTemplateData;
