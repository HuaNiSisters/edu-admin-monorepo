"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { smsService } from "@/lib/services";
import { actionToSampleContext, SMSAction } from "@/types/smsActions";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <label htmlFor="sms-template-name" className="text-sm font-medium">Template name</label>
          <Input
            id="sms-template-name"
            placeholder="Template name"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            readOnly={!isEditing}
          />
        </div>
        <SmsTemplateVariableSelector
          textareaRef={textareaRef}
          content={content}
          context={sampleContext}
          editable={Boolean(isEditing)}
          onContentChange={setContent}

        />
        <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          Tags are replaced with real data before sending. Receiver name tags use
          the name of each student or parent receiving the SMS.
        </p>
      </div>

      <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="sms-template-message" className="text-sm font-medium">Message</label>
            <span className="text-sm text-muted-foreground">{content.length}/1600</span>
          </div>
          <Textarea
            id="sms-template-message"
            ref={textareaRef}
            value={content}
            placeholder="Template content e.g. Hi {{student.full_name}}"
            onChange={(event) => setContent(event.target.value)}
            readOnly={!isEditing}
            maxLength={1600}
            className="min-h-[360px] resize-y text-base leading-relaxed lg:min-h-[480px]"
          />
          {validationError && (
            <p className="text-destructive text-sm" role="alert">
              {validationError}
            </p>
          )}
        </div>
        {isEditing ? (
          <div className="flex justify-end">
            <Button
              onClick={saveTemplate}
              disabled={!templateName.trim() || Boolean(validationError)}
            >
              Save template
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3 rounded-md border p-4">
            <div className="min-w-0 flex-1 space-y-2">
              <label htmlFor="test-phone-number" className="text-sm font-medium">Send test SMS to</label>
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
    </div>
  );
};

export default SMSTemplateData;
