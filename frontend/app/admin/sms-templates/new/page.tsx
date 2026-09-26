"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { smsService } from "@/lib/services";
import { actionToSampleContext, SMSAction } from "@/types/smsActions";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SmsTemplateVariableSelector, {
  cloneTemplateContext,
  getInvalidTemplateVariables,
} from "../_components/sms-template-variable-selector";

export default function CreateSMSTemplatePage() {
  const router = useRouter();
  const { run, isPending } = useAsync();
  const [templateName, setTemplateName] = useState("");
  const [content, setContent] = useState("");
  const [sampleContext, setSampleContext] = useState(() =>
    cloneTemplateContext(actionToSampleContext[SMSAction.Owings]),
  );
  const invalidVariables = useMemo(
    () => getInvalidTemplateVariables(content, sampleContext),
    [content, sampleContext],
  );

  const canSubmit =
    templateName.trim().length > 0 &&
    content.trim().length > 0 &&
    invalidVariables.length === 0 &&
    !isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    run(async () => {
      const template = await smsService.createSMSTemplateAsync({
        name: templateName.trim(),
        content: content.trim(),
      });
      toast.success("SMS template created successfully", {
        position: "top-center",
      });
      sessionStorage.setItem("selectedSmsTemplateId", template.id);
      router.push("/admin/sms-templates");
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back to SMS templates"
          onClick={() => router.push("/admin/sms-templates")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create SMS template</h1>
          <p className="text-muted-foreground text-sm">
            The template will be created with the configured SMS provider and
            assigned a local ID.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template details</CardTitle>
          <CardDescription>
            Use named variables such as {"{{student.full_name}}"} in the
            message body.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Outstanding payment reminder"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-content">Message</Label>
                <span className="text-muted-foreground text-sm">
                  {content.length}/1600
                </span>
              </div>
              <Textarea
                id="template-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Hi {{student.full_name}}, your balance is {{invoice.amount_due}}."
                maxLength={1600}
                className="min-h-40"
              />
              {invalidVariables.length > 0 && (
                <p className="text-destructive text-sm" role="alert">
                  The following variables are not valid: {invalidVariables.join(", ")}
                </p>
              )}
            </div>

            <SmsTemplateVariableSelector
              content={content}
              context={sampleContext}
              editable
              onContentChange={setContent}
              onContextChange={setSampleContext}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.push("/admin/sms-templates")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
