"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { smsApi } from "@/lib/api/sms";
import { actionToSampleContext, SMSAction } from "@/types/smsActions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getPropertyByPath(obj: any, path: string): any {
  return path.split(".").reduce((curr, key) => curr?.[key], obj);
}

function updatePropertyByPath(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const result = { ...obj };
  let curr = result;

  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = { ...curr[key] };
      curr = curr[key];
    }
  });

  return result;
}

const SMSTemplateData = ({
  smsAction,
  isEditing,
}: {
  smsAction: SMSAction;
  isEditing?: boolean;
}) => {
  const router = useRouter();

  const [sampleContext, setSampleContext] = useState<{
    [key: string]: { [key: string]: any };
  }>();
  const [contextFields, setContextFields] = useState<string[]>([]);
  const [textAreaString, setTextAreaString] = useState("");
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  const [templateValidationErrorMessage, setTemplateValidationErrorMessage] =
    useState("");
  const [templateName, setTemplateName] = useState("");
  const { run } = useAsync();

  const templateId = "HX8287cd145a356a5415090602424c2531";
  const [toTestPhoneNumber, setToTestPhoneNumber] = useState("+61420398812");

  useEffect(() => {
    setSampleContext(deepClone(actionToSampleContext[smsAction]));
    smsApi.getSMSTemplateByIdAsync(templateId).then((template) => {
      console.log({ fetchedTemplate: template });
      setTemplateName(template.name);
      setTextAreaString(template.content);
    });
  }, [smsAction]);

  useEffect(() => {
    if (sampleContext && Object.keys(sampleContext).length > 0) {
      const fields = Object.keys(sampleContext).flatMap((key) =>
        Object.keys(sampleContext[key]).map((field) => `${key}.${field}`),
      );
      setContextFields(fields);
    }
  }, [sampleContext]);

  // Validation to ensure that variables in the template are part of the context fields
  useEffect(() => {
    const regex = /{{(.*?)}}/g;
    const matches = textAreaString.match(regex);
    if (matches) {
      const variables = matches.map((match) => match.replace(/{{|}}/g, ""));
      validateTemplate();
      setTemplateVariables(variables);
    } else {
      setTemplateVariables([]);
    }
  }, [textAreaString]);

  const hasVariableBeenAdded = (variable: string) => {
    return templateVariables.includes(variable);
  };

  const addVariableToTemplate = (variable: string) => {
    if (!hasVariableBeenAdded(variable)) {
      setTemplateVariables((prev) => [...prev, variable]);
      setTextAreaString((prev) => prev + `{{${variable}}}`);
    }
  };

  const removeVariableFromTemplate = (variable: string) => {
    setTemplateVariables((prev) =>
      prev.filter((existingVariable) => existingVariable !== variable),
    );
    const variableWithBraces = `{{${variable}}}`;
    setTextAreaString((prev) => prev.replace(variableWithBraces, ""));
  };

  const validateTemplate = () => {
    const regex = /{{(.*?)}}/g;
    const matches = textAreaString.match(regex);
    if (matches) {
      const variables = matches.map((match) => match.replace(/{{|}}/g, ""));
      const invalidVariables = variables.filter(
        (variable) => !contextFields.includes(variable),
      );
      if (invalidVariables.length > 0) {
        setTemplateValidationErrorMessage(
          `The following variables are not valid: ${invalidVariables.join(", ")}`,
        );
      } else {
        setTemplateValidationErrorMessage("");
      }
    }
  };

  const saveTemplate = () => {
    run(async () => {
      if (!templateName) {
        throw "Please provide a template name before saving.";
      }

      if (templateValidationErrorMessage) {
        throw "Please fix template errors before saving.";
      }

      await smsApi.updateSMSTemplateAsync(templateId, {
        name: templateName,
        content: textAreaString,
      });

      toast.success("Template updated successfully!", {
        position: "top-center",
      });

      router.push(`/admin/sms-templates/${templateId}`);
    });
  };

  const sendTestSMS = () => {
    // Get variables from the template and provide example values from the sample context
    const sampleVariables = templateVariables.reduce(   
      (acc, variable) => {
        acc[variable] = getPropertyByPath(sampleContext, variable);
        return acc;
      },
      {} as Record<string, any>,
    );

    run(async () => {
      await smsApi.sendSMSTemplateAsync(templateId, toTestPhoneNumber, sampleVariables);
      toast.success("Test SMS sent successfully!", {
        position: "top-center",
      });
    });
  };

  return (
    <div>
      <Input
        placeholder="Template name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        disabled={!isEditing}
      />
      <br /> <br />
      <Textarea
        value={textAreaString}
        placeholder="Template content e.g. Hi {{student.first_name}}"
        onChange={(e) => setTextAreaString(e.target.value)}
        disabled={!isEditing}
        maxLength={1600}
      />
      {templateValidationErrorMessage && (
        <div style={{ color: "red" }}>{templateValidationErrorMessage}</div>
      )}
      <br />
      {contextFields.length > 0 && (
        <div>
          <b style={{ fontSize: "20px" }}>Select variables</b>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>
                  <b>Variable</b>
                </TableCell>
                <TableCell>
                  <b>Example value</b>
                </TableCell>
                <TableCell>
                  <b>Usage</b>
                </TableCell>
              </TableRow>
            </TableHeader>
            {contextFields.map((field) => (
              <TableRow key={field}>
                <TableCell>{field}</TableCell>
                <TableCell>
                  {isEditing && (
                    <span style={{ color: "gray" }}>
                      {getPropertyByPath(sampleContext, field)}
                    </span>
                  )}
                  {!isEditing && (
                    <Input
                      value={getPropertyByPath(sampleContext, field)}
                      onChange={(e) =>
                        setSampleContext(
                          updatePropertyByPath(
                            sampleContext,
                            field,
                            e.target.value,
                          ),
                        )
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  {!hasVariableBeenAdded(field) && (
                    <Button
                      onClick={() => addVariableToTemplate(field)}
                      disabled={!isEditing}
                    >
                      Add as variable
                    </Button>
                  )}
                  {hasVariableBeenAdded(field) && (
                    <Button
                      onClick={() => removeVariableFromTemplate(field)}
                      disabled={!isEditing}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {/* {JSON.stringify(sampleContext)} */}
        </div>
      )}
      <br />
      {isEditing && (
        <Button
          onClick={saveTemplate}
          disabled={!templateName || templateValidationErrorMessage !== ""}
        >
          Save template
        </Button>
      )}
      {!isEditing && (
        <>
          Send test SMS to:
          <Input
            value={toTestPhoneNumber}
            onChange={(e) => setToTestPhoneNumber(e.target.value)}
          />
          <br />
          <br />
          <Button onClick={sendTestSMS}>Send Test SMS</Button>
        </>
      )}
    </div>
  );
};

export default SMSTemplateData;
