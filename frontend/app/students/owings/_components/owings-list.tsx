"use client";

import { useEffect, useMemo, useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { StudentOwing } from "@/lib/api/types/owing";
import FilterContent from "@/components/filter-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { createOwingColumns, OWING_SENT_FILTER_ID } from "./owings-columns";
import { useRouter } from "next/navigation";
import { smsService } from "@/lib/services";
import type { SMSTemplateSummary } from "@/lib/api/types/sms";
import { formatPhoneNumber, toSmsPhoneNumber } from "@/utils/phone-utils";
import { toast } from "sonner";

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayInMilliseconds = 24 * 60 * 60 * 1000;

type OwingParent = StudentOwing["parents"][number];
type OwingRecipient = {
  label: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  phoneNumber: string | null;
  parent?: OwingParent;
};

function getOwingRecipients(owing: StudentOwing): OwingRecipient[] {
  const candidates: OwingRecipient[] = [
    {
      label: `Student: ${owing.student_name}`,
      firstName: owing.student_first_name,
      lastName: owing.student_last_name,
      fullName: owing.student_name,
      phone: owing.student_mobile,
      phoneNumber: toSmsPhoneNumber(owing.student_mobile),
    },
    ...owing.parents.map((parent) => ({
      label: `Parent: ${parent.name}`,
      firstName: parent.first_name,
      lastName: parent.last_name,
      fullName: parent.name,
      phone: parent.phone,
      phoneNumber: toSmsPhoneNumber(parent.phone),
      parent,
    })),
  ];
  const seenPhoneNumbers = new Set<string>();
  return candidates.filter(({ phoneNumber }) => {
    if (!phoneNumber) return true;
    if (seenPhoneNumbers.has(phoneNumber)) return false;
    seenPhoneNumbers.add(phoneNumber);
    return true;
  });
}

function getOwingTemplateValues(
  owing?: StudentOwing,
  recipient?: OwingRecipient,
): Record<string, string> {
  if (!owing) return {};
  const parent = recipient?.parent ?? owing.parents[0];

  const startDay = Date.parse(
    `${owing.term_start_date.slice(0, 10)}T00:00:00Z`,
  );
  const endDay = Date.parse(`${owing.term_end_date.slice(0, 10)}T00:00:00Z`);
  const today = new Date();
  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const numberOfWeeks = Math.max(
    1,
    Math.ceil(
      (endDay - startDay + dayInMilliseconds) / (7 * dayInMilliseconds),
    ),
  );
  const currentWeek = Math.min(
    numberOfWeeks,
    Math.max(
      1,
      Math.floor((todayDay - startDay) / (7 * dayInMilliseconds)) + 1,
    ),
  );

  return {
    "receiver.first_name": recipient?.firstName ?? owing.student_first_name,
    "receiver.last_name": recipient?.lastName ?? owing.student_last_name,
    "receiver.full_name": recipient?.fullName ?? owing.student_name,
    "student.full_name": owing.student_name,
    "student.first_name": owing.student_first_name,
    "student.last_name": owing.student_last_name,
    "student.mobile": owing.student_mobile,
    ...(parent && {
      "parent.full_name": parent.name,
      "parent.phone": parent.phone,
    }),
    "term.week_number": String(currentWeek),
    "term.number": String(owing.term_name),
    "term.year": String(owing.term_year),
    "term.label": owing.term_label,
    "term.n_weeks": String(numberOfWeeks),
    "term.start_date": dateFormatter.format(new Date(startDay)),
    "term.end_date": dateFormatter.format(new Date(endDay)),
    "invoice.amount_due": currency.format(owing.amount_outstanding),
    "subject.name": owing.subject_name,
    "subject.grade": String(owing.grade),
    "subject.location": formatValuesRemoveUnderscores(owing.location),
    "class.day_of_week": owing.day_of_week,
    "class.start_time": owing.start_time,
    ...(owing.tutor && { "class.tutor": owing.tutor }),
  };
}

export default function OwingsList({ owings }: { owings: StudentOwing[] }) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates, setTemplates] = useState<SMSTemplateSummary[]>([]);
  const [templateContent, setTemplateContent] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [previewRecipientIndex, setPreviewRecipientIndex] = useState(0);
  const [completedRecipientKeys, setCompletedRecipientKeys] = useState<
    Set<string>
  >(new Set());
  const [mockSend, setMockSend] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [reloadStatus, setReloadStatus] = useState(0);
  const owingsWithStatus = useMemo(
    () =>
      owings.map((owing) => ({
        ...owing,
        sent_templates: templates
          .filter((template) => {
            const recipients = getOwingRecipients(owing);
            return (
              recipients.length > 0 &&
              recipients.every(
                (recipient) =>
                  recipient.phoneNumber &&
                  completedRecipientKeys.has(
                    `${template.id}:${owing.enrolment_id}:${owing.term_id}:${recipient.phoneNumber}`,
                  ),
              )
            );
          })
          .map(({ id }) => id),
      })),
    [owings, templates, completedRecipientKeys],
  );
  const allSelected = owings.length > 0 && selectedIds.size === owings.length;

  const columns = useMemo(
    () =>
      createOwingColumns({
        selectedIds,
        allSelected,
        onToggleSelected: (enrolmentId, selected) => {
          setSelectedIds((previous) => {
            const next = new Set(previous);
            if (selected) next.add(enrolmentId);
            else next.delete(enrolmentId);
            return next;
          });
        },
        onToggleAll: (selected) => {
          setSelectedIds(
            selected
              ? new Set(owings.map((owing) => owing.enrolment_id))
              : new Set(),
          );
        },
        templates,
        statusLoading,
        statusError,
      }),
    [allSelected, owings, selectedIds, templates, statusLoading, statusError],
  );

  const termOptions = useMemo(
    () => [...new Set(owings.map((owing) => owing.term_label))].sort(),
    [owings],
  );
  const gradeOptions = useMemo(
    () =>
      [...new Set(owings.map((owing) => String(owing.grade)))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [owings],
  );
  const subjectOptions = useMemo(
    () => [...new Set(owings.map((owing) => owing.subject_name))].sort(),
    [owings],
  );
  const locationOptions = useMemo(
    () =>
      [
        ...new Set(
          owings.map((owing) => formatValuesRemoveUnderscores(owing.location)),
        ),
      ].sort(),
    [owings],
  );
  const hasActiveFilters = columnFilters.length > 0;
  const searchValue =
    (columnFilters.find((filter) => filter.id === "student_name")
      ?.value as string) ?? "";

  useEffect(() => {
    let cancelled = false;
    setStatusLoading(true);
    setStatusError("");
    Promise.all([
      smsService.getSMSTemplatesAsync(),
      smsService.getOwingSmsSendsAsync(),
      smsService.getSmsSendMode(),
    ])
      .then(([loadedTemplates, sends, mode]) => {
        if (cancelled) return;
        setTemplates(loadedTemplates);
        setMockSend(mode.mock);
        setCompletedRecipientKeys(
          new Set(
            sends.map(
              (send) =>
                `${send.template_id}:${send.enrolment_id}:${send.term_id}:${send.phone_number}`,
            ),
          ),
        );
        setSelectedTemplate((current) =>
          loadedTemplates.some(({ id }) => id === current)
            ? current
            : (loadedTemplates[0]?.id ?? ""),
        );
      })
      .catch(() => {
        if (!cancelled)
          setStatusError("Unable to load SMS templates and sent status.");
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadStatus]);

  useEffect(() => {
    if (!selectedTemplate || !sendDialogOpen) {
      setTemplateContent("");
      return;
    }
    let cancelled = false;
    setTemplateLoading(true);
    setTemplateError("");
    smsService
      .getSMSTemplateByIdAsync(selectedTemplate)
      .then((template) => {
        if (!cancelled) setTemplateContent(template.content);
      })
      .catch(() => {
        if (!cancelled) setTemplateError("Unable to load this SMS template.");
      })
      .finally(() => {
        if (!cancelled) setTemplateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTemplate, sendDialogOpen]);

  const previewOwing =
    owings.find(({ enrolment_id }) => selectedIds.has(enrolment_id)) ??
    owings[0];
  const previewRecipients = previewOwing
    ? getOwingRecipients(previewOwing)
    : [];
  const previewRecipient =
    previewRecipients[previewRecipientIndex] ?? previewRecipients[0];
  const previewValues = getOwingTemplateValues(previewOwing, previewRecipient);
  const usedVariables = [
    ...new Set(
      [...templateContent.matchAll(/{{(.*?)}}/g)]
        .map((match) => match[1]?.trim())
        .filter((variable): variable is string => Boolean(variable)),
    ),
  ];
  const preview = templateContent.replace(
    /{{(.*?)}}/g,
    (match, variable: string) => previewValues[variable.trim()] ?? match,
  );
  const selectedOwings = owings.filter(({ enrolment_id }) =>
    selectedIds.has(enrolment_id),
  );
  const sendTargets = selectedOwings.flatMap((owing) =>
    getOwingRecipients(owing).map((recipient, index) => ({
      owing,
      recipient,
      key: `${selectedTemplate}:${owing.enrolment_id}:${owing.term_id}:${recipient.phoneNumber ?? `invalid-${index}`}`,
    })),
  );
  const pendingTargets = sendTargets.filter(
    ({ key }) => !completedRecipientKeys.has(key),
  );
  const sendBlockers = pendingTargets.flatMap(({ owing, recipient }) => {
    const values = getOwingTemplateValues(owing, recipient);
    const missingVariables = usedVariables.filter(
      (variable) => !values[variable]?.trim(),
    );
    const problems = [
      ...(!recipient.phoneNumber
        ? [`invalid or missing mobile number: ${recipient.phone || "none"}`]
        : []),
      ...(missingVariables.length
        ? [`missing ${missingVariables.join(", ")}`]
        : []),
    ];
    return problems.length
      ? [
          `${recipient.label} (${owing.term_label}, ${owing.subject_name}): ${problems.join("; ")}`,
        ]
      : [];
  });

  async function sendMessages() {
    if (
      isSending ||
      statusLoading ||
      Boolean(statusError) ||
      !selectedTemplate ||
      !templateContent.trim() ||
      !pendingTargets.length ||
      sendBlockers.length
    )
      return;

    setIsSending(true);
    setSendError("");
    const failed: typeof pendingTargets = [];
    const newlyCompletedKeys = new Set<string>();
    for (const target of pendingTargets) {
      const { owing, recipient, key } = target;
      if (!recipient.phoneNumber) {
        failed.push(target);
        continue;
      }
      const values = getOwingTemplateValues(owing, recipient);
      const variables = Object.fromEntries(
        usedVariables.map((variable) => [variable, values[variable]]),
      );
      try {
        await smsService.sendSMSTemplateAsync(
          selectedTemplate,
          recipient.phoneNumber,
          variables,
          { enrolmentId: owing.enrolment_id, termId: owing.term_id },
        );
        newlyCompletedKeys.add(key);
      } catch {
        failed.push(target);
      }
    }

    const allCompletedKeys = new Set([
      ...completedRecipientKeys,
      ...newlyCompletedKeys,
    ]);
    setCompletedRecipientKeys(allCompletedKeys);
    const sentCount = newlyCompletedKeys.size;
    if (sentCount) {
      toast.success(
        mockSend
          ? `Marked ${sentCount} mock messages as sent. No SMS was sent.`
          : `Sent ${sentCount} text ${sentCount === 1 ? "message" : "messages"}.`,
      );
    }
    if (failed.length) {
      setSendError(
        `${failed.length} ${failed.length === 1 ? "message failed" : "messages failed"} to send. Only those recipients will be retried.`,
      );
      setSelectedIds(new Set(failed.map(({ owing }) => owing.enrolment_id)));
    } else {
      setSelectedIds(new Set());
      setSendDialogOpen(false);
    }
    setIsSending(false);
  }

  return (
    <div className="space-y-3">
      {mockSend && (
        <p
          role="status"
          className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          Mock SMS mode: sending saves the Sent status, but no SMS is sent.
          These checkmarks persist even after mock mode is disabled.
        </p>
      )}
      <div className="flex justify-end">
        <Button
          disabled={statusLoading || Boolean(statusError)}
          onClick={() => setSendDialogOpen(true)}
        >
          Send message
        </Button>
      </div>
      {statusError && (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          {statusError}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadStatus((value) => value + 1)}
          >
            Retry
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <FilterContent
          filterValue="term_label"
          filterName="Terms"
          placeholderName="Term"
          options={termOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <FilterContent
          filterValue="grade"
          filterName="Grades"
          placeholderName="Grade"
          options={gradeOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <FilterContent
          filterValue="subject_name"
          filterName="Subjects"
          placeholderName="Subject"
          options={subjectOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <FilterContent
          filterValue="location"
          filterName="Locations"
          placeholderName="Location"
          options={locationOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <Input
          className="h-9 w-[220px]"
          placeholder="Search student"
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setColumnFilters((previous) => {
              const others = previous.filter(
                (filter) => filter.id !== "student_name",
              );
              return value
                ? [...others, { id: "student_name", value }]
                : others;
            });
          }}
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setColumnFilters([])}
          >
            <X className="size-3.5" /> Clear filters
          </Button>
        )}
      </div>
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {selectedIds.size} selected
      </div>
      <DataTable
        columns={columns}
        data={owingsWithStatus}
        onRowClick={(row) => router.replace(`/student/${row.student_id}`)}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={{
          grade: false,
          subject_name: false,
          location: false,
          [OWING_SENT_FILTER_ID]: false,
        }}
      />

      <Dialog
        open={sendDialogOpen}
        onOpenChange={(open) => {
          if (!isSending) setSendDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select SMS Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {mockSend && (
              <p
                role="status"
                className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
              >
                Mock SMS mode — this records sent status without sending any
                SMS.
              </p>
            )}
            <Select
              disabled={isSending}
              value={selectedTemplate}
              onValueChange={(templateId) => {
                setTemplateContent("");
                setSendError("");
                setPreviewRecipientIndex(0);
                setSelectedTemplate(templateId);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templateError && (
              <p className="text-sm text-destructive">{templateError}</p>
            )}
            {!templates.length && !templateError && (
              <p className="text-sm text-muted-foreground">
                No SMS templates available.
              </p>
            )}
            {selectedTemplate && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview</h3>
                {previewRecipients.length > 1 && (
                  <Select
                    disabled={isSending}
                    value={String(previewRecipients.indexOf(previewRecipient))}
                    onValueChange={(index) =>
                      setPreviewRecipientIndex(Number(index))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Preview recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {previewRecipients.map((recipient, index) => (
                        <SelectItem key={index} value={String(index)}>
                          {recipient.label} (
                          {formatPhoneNumber(recipient.phone) || "No mobile"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="min-h-20 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                  {templateLoading
                    ? "Loading preview…"
                    : preview || "This template is empty."}
                </div>
                <p className="text-xs text-muted-foreground">
                  {previewOwing
                    ? `Preview uses ${previewOwing.student_name}’s owing details for ${previewRecipient.label}.`
                    : "Select an owing to preview tag values."}
                </p>
                {!templateLoading && usedVariables.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <h4 className="font-medium">Tag values</h4>
                    {usedVariables.map((variable) => (
                      <div
                        key={variable}
                        className="flex justify-between gap-3 border-b py-1 last:border-0"
                      >
                        <code className="break-all">{variable}</code>
                        <span className="text-right">
                          {previewValues[variable] ?? "No owing value"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Send to the student and each parent for the{" "}
              {selectedOwings.length} selected owings ({pendingTargets.length}{" "}
              {pendingTargets.length === 1 ? "message" : "messages"}).
            </p>
            {sendBlockers.length > 0 && (
              <div className="space-y-1 text-sm text-destructive" role="alert">
                <p>Resolve these details before sending:</p>
                <ul className="list-disc pl-5">
                  {sendBlockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            )}
            {sendError && (
              <p className="text-sm text-destructive" role="alert">
                {sendError}
              </p>
            )}
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              Please double-check the Enrolment fee for the subjects if your
              selected message includes the Fee to ensure the details are
              correct.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSending}
              onClick={() => setSendDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={sendMessages}
              disabled={
                isSending ||
                templateLoading ||
                Boolean(templateError) ||
                !selectedTemplate ||
                !templateContent.trim() ||
                !pendingTargets.length ||
                sendBlockers.length > 0
              }
            >
              {isSending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSending ? "Sending…" : mockSend ? "Simulate send" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
