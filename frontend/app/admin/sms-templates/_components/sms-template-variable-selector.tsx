"use client";

import { Button } from "@/components/ui/button";
import type { RefObject } from "react";

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

interface SmsTemplateVariableSelectorProps {
  content: string;
  context: SmsTemplateContext;
  editable: boolean;
  onContentChange: (content: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export default function SmsTemplateVariableSelector({
  content,
  context,
  editable,
  onContentChange,
  textareaRef,
}: SmsTemplateVariableSelectorProps) {
  const contextFields = getContextFields(context);
  const templateVariables = getTemplateVariables(content);
  const variableCounts = [...content.matchAll(templateVariablePattern)].reduce(
    (counts, match) => {
      const variable = match[1]?.trim();
      if (variable) counts[variable] = (counts[variable] ?? 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  function addVariable(variable: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const token = `{{${variable}}}`;
    const nextContent = content.slice(0, start) + token + content.slice(end);
    if (
      textarea &&
      textarea.maxLength >= 0 &&
      nextContent.length > textarea.maxLength
    ) {
      return;
    }

    onContentChange(nextContent);
    requestAnimationFrame(() => {
      if (!textarea) return;
      const nextPosition = start + token.length;
      textarea.focus();
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  }

  if (contextFields.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">Tags</h2>
        {editable && (
          <p className="text-sm text-muted-foreground">
            Place the cursor in the message, then click a variable to insert it.
            Click again to use it more than once.
          </p>
        )}
      </div>

      {editable ? (
        <div className="grid gap-4 rounded-md border p-4">
          {Object.entries(context).map(([group, values]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(values).map((field) => {
                  const variable = `${group}.${field}`;
                  const count = variableCounts[variable] ?? 0;
                  return (
                    <Button
                      key={variable}
                      type="button"
                      size="xs"
                      variant="outline"
                      className="h-auto max-w-full whitespace-normal break-all rounded-full py-1 font-mono text-left"
                      title={`Example: ${values[field]}`}
                      aria-label={`Add ${variable} to message${count ? `; used ${count} times` : ""}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addVariable(variable)}
                    >
                      {variable}
                      {count > 0 && (
                        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                          {count}×
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : templateVariables.length > 0 ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
            <span>Tag</span>
            <span className="text-right">Example</span>
          </div>
          {templateVariables.map((variable) => {
            const exampleValue = getContextValue(context, variable);
            return (
              <div key={variable} className="grid grid-cols-2 items-baseline gap-4 border-b pb-2 text-sm last:border-0">
                <span className="min-w-0 break-words font-mono text-xs">{variable}</span>
                <p className="min-w-0 break-words text-right text-muted-foreground">
                  {exampleValue !== undefined
                    ? String(exampleValue)
                    : "No example available"}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This template does not use any variables.
        </p>
      )}
    </div>
  );
}
