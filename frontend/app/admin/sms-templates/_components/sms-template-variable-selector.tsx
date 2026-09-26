"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SmsTemplateContext = Record<
  string,
  Record<string, string | number>
>;

const templateVariablePattern = /{{(.*?)}}/g;

export function cloneTemplateContext(
  context: SmsTemplateContext,
): SmsTemplateContext {
  return structuredClone(context);
}

export function getContextFields(context: SmsTemplateContext): string[] {
  return Object.entries(context).flatMap(([group, values]) =>
    Object.keys(values).map((field) => `${group}.${field}`),
  );
}

export function getTemplateVariables(content: string): string[] {
  return [
    ...new Set(
      [...content.matchAll(templateVariablePattern)]
        .map((match) => match[1]?.trim())
        .filter((variable): variable is string => Boolean(variable)),
    ),
  ];
}

export function getInvalidTemplateVariables(
  content: string,
  context: SmsTemplateContext,
): string[] {
  const validVariables = new Set(getContextFields(context));
  return getTemplateVariables(content).filter(
    (variable) => !validVariables.has(variable),
  );
}

export function getContextValue(
  context: SmsTemplateContext,
  path: string,
): string | number | undefined {
  const [group, field] = path.split(".");
  return group && field ? context[group]?.[field] : undefined;
}

function updateContextValue(
  context: SmsTemplateContext,
  path: string,
  value: string,
): SmsTemplateContext {
  const [group, field] = path.split(".");
  if (!group || !field || !context[group]) return context;
  return {
    ...context,
    [group]: { ...context[group], [field]: value },
  };
}

interface SmsTemplateVariableSelectorProps {
  content: string;
  context: SmsTemplateContext;
  editable: boolean;
  onContentChange: (content: string) => void;
  onContextChange?: (context: SmsTemplateContext) => void;
}

export default function SmsTemplateVariableSelector({
  content,
  context,
  editable,
  onContentChange,
  onContextChange,
}: SmsTemplateVariableSelectorProps) {
  const contextFields = getContextFields(context);
  const templateVariables = getTemplateVariables(content);

  function addVariable(variable: string) {
    if (!templateVariables.includes(variable)) {
      onContentChange(`${content}{{${variable}}}`);
    }
  }

  function removeVariable(variable: string) {
    onContentChange(content.split(`{{${variable}}}`).join(""));
  }

  if (contextFields.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Select variables</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Example value</TableHead>
              <TableHead className="text-right">Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contextFields.map((field) => {
              const isAdded = templateVariables.includes(field);
              const exampleValue = getContextValue(context, field);
              return (
                <TableRow key={field}>
                  <TableCell className="font-mono text-sm">{field}</TableCell>
                  <TableCell>
                    {editable || !onContextChange ? (
                      <span className="text-muted-foreground">
                        {exampleValue}
                      </span>
                    ) : (
                      <Input
                        value={String(exampleValue ?? "")}
                        onChange={(event) =>
                          onContextChange(
                            updateContextValue(context, field, event.target.value),
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant={isAdded ? "outline" : "default"}
                      disabled={!editable}
                      onClick={() =>
                        isAdded ? removeVariable(field) : addVariable(field)
                      }
                    >
                      {isAdded ? "Remove" : "Add as variable"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
