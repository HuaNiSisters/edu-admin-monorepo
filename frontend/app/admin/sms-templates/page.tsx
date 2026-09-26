"use client";

import { LoadingBar } from "@/components/loading-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAsync } from "@/hooks/use-async";
import type { SMSTemplateSummary } from "@/lib/api/types/sms";
import { smsService } from "@/lib/services";
import { SMSAction } from "@/types/smsActions";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SMSTemplateData from "./_components/sms-template-data";

const SMSTemplatesPage = () => {
  const router = useRouter();
  const { run, isPending } = useAsync();
  const [templates, setTemplates] = useState<SMSTemplateSummary[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);

  const loadTemplates = useCallback(() => {
    run(async () => {
      const loadedTemplates = await smsService.getSMSTemplatesAsync();
      const newlyCreatedTemplateId = sessionStorage.getItem(
        "selectedSmsTemplateId",
      );
      sessionStorage.removeItem("selectedSmsTemplateId");
      setTemplates(loadedTemplates);
      setSelectedTemplateId((currentId) => {
        if (
          newlyCreatedTemplateId &&
          loadedTemplates.some(({ id }) => id === newlyCreatedTemplateId)
        ) {
          return newlyCreatedTemplateId;
        }
        if (loadedTemplates.some(({ id }) => id === currentId)) {
          return currentId;
        }
        return loadedTemplates[0]?.id ?? "";
      });
    });
  }, [run]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const selectedTemplate = templates.find(
    ({ id }) => id === selectedTemplateId,
  );

  function selectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    setIsEditing(false);
    setEditorVersion((version) => version + 1);
  }

  function finishEditing() {
    setIsEditing(false);
    setEditorVersion((version) => version + 1);
    loadTemplates();
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditorVersion((version) => version + 1);
  }

  return (
    <div className="space-y-6">
      <LoadingBar isLoading={isPending} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SMS templates</h1>
          <p className="text-muted-foreground text-sm">
            Select a template to view, test, or edit it.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/admin/sms-templates/new")}
        >
          <Plus className="size-4" />
          New template
        </Button>
      </div>

      <div className="space-y-2">
        <label htmlFor="sms-template-select" className="text-sm font-medium">
          Template
        </label>
        <Select value={selectedTemplateId} onValueChange={selectTemplate}>
          <SelectTrigger id="sms-template-select" className="w-full max-w-xl">
            <SelectValue placeholder="Select an SMS template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} ({template.provider})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTemplateId && !isPending && (
        <div className="text-muted-foreground rounded-md border p-8 text-center">
          No SMS templates have been created.
        </div>
      )}

      {selectedTemplate && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{selectedTemplate.name}</CardTitle>
            {isEditing ? (
              <Button variant="outline" onClick={cancelEditing}>
                Cancel editing
              </Button>
            ) : (
              <Button className="gap-2" onClick={() => setIsEditing(true)}>
                <Pencil className="size-4" />
                Edit template
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <SMSTemplateData
              key={`${selectedTemplateId}-${editorVersion}`}
              templateId={selectedTemplateId}
              smsAction={SMSAction.Owings}
              isEditing={isEditing}
              onSaved={finishEditing}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SMSTemplatesPage;
