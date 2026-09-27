"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  employeeFormSchemas,
  EMPLOYEE_ROLE_OPTIONS,
  type EmployeeRecord,
} from "@/lib/employees/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/utils/phone-utils";
import { createClient } from "@/lib/api/supabase/client";

type EmployeeField = {
  key: string;
  label: string;
  type?: "date" | "tel" | "number" | "textarea" | "gender";
  max?: number;
  adminOnly?: boolean;
};
const sections: { title: string; fields: EmployeeField[] }[] = [
  {
    title: "Personal details",
    fields: [
      { key: "date_of_birth", label: "Date of birth", type: "date" },
      { key: "gender", label: "Gender", type: "gender" },
      { key: "phone", label: "Mobile", type: "tel", max: 40 },
      { key: "address", label: "Address", max: 500 },
    ],
  },
  {
    title: "Employment",
    fields: [
      { key: "job", label: "Job", max: 100, adminOnly: true },
      { key: "start_date", label: "Start date", type: "date", adminOnly: true },
      { key: "end_date", label: "End date", type: "date", adminOnly: true },
      {
        key: "start_hourly_rate",
        label: "Start hourly rate ($)",
        type: "number",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Emergency contact",
    fields: [
      { key: "emergency_contact_name", label: "Emergency contact name" },
      {
        key: "emergency_contact_mobile",
        label: "Emergency contact mobile",
        type: "tel",
        max: 40,
      },
    ],
  },
  {
    title: "Payroll and superannuation",
    fields: [
      { key: "tfn", label: "TFN", max: 40, adminOnly: true },
      { key: "account_name", label: "Account name", adminOnly: true },
      { key: "bsb", label: "BSB", max: 7, adminOnly: true },
      {
        key: "account_number",
        label: "Account number",
        max: 40,
        adminOnly: true,
      },
      { key: "super_name", label: "Super name", adminOnly: true },
      {
        key: "super_member_number",
        label: "Super member number",
        max: 100,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Education and checks",
    fields: [
      { key: "high_school", label: "High school" },
      { key: "university_course", label: "University course" },
      {
        key: "working_with_children",
        label: "Working with Children check",
        max: 100,
      },
      { key: "police_check", label: "Police check" },
      {
        key: "special_skills",
        label: "Special skills",
        type: "textarea",
        max: 2000,
      },
      {
        key: "hsc_subjects",
        label: "HSC subjects (one per line)",
        type: "textarea",
        max: 4500,
      },
    ],
  },
];

function valuesFrom(initial: EmployeeRecord): Record<string, string> {
  const record = initial as unknown as Record<string, unknown>;
  const values: Record<string, string> = {
    first_name: initial.first_name,
    last_name: initial.last_name,
    email: initial.email ?? "",
  };
  for (const field of sections.flatMap((section) => section.fields)) {
    const value = record[field.key];
    values[field.key] = Array.isArray(value)
      ? value.join("\n")
      : value == null
        ? field.key === "job"
          ? "tutor"
          : ""
        : String(value);
    if (field.type === "tel")
      values[field.key] = formatPhoneNumber(values[field.key]);
  }
  return values;
}

export function EmployeeForm({
  initial,
  mode,
}: {
  initial: EmployeeRecord;
  mode: "create" | "admin" | "self";
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => valuesFrom(initial));
  const [values, setValues] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(mode === "create");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const creation = mode === "create";
  const setValue = (key: string, value: string) => {
    const formatted =
      key === "phone" || key === "emergency_contact_mobile"
        ? formatPhoneNumber(value)
        : value;
    setValues((current) => ({ ...current, [key]: formatted }));
    setMessage(null);
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || saving) return;
    setError(null);
    setMessage(null);
    const body: Record<string, unknown> = {};
    for (const field of sections.flatMap((section) => section.fields)) {
      if (mode === "self" && field.adminOnly) continue;
      body[field.key] =
        field.key === "hsc_subjects"
          ? values[field.key]
              .split("\n")
              .map((value) => value.trim())
              .filter(Boolean)
          : values[field.key];
    }
    if (creation)
      Object.assign(body, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      });
    const schema = employeeFormSchemas[mode];
    const validated = schema.safeParse(body);
    if (!validated.success) {
      setError(
        validated.error.issues[0]?.message ?? "Check the employee details.",
      );
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      let createdTutorId: string | null = null;
      if (creation) {
        const { first_name, last_name, email, phone, ...details } = validated.data;
        const { data: tutorId, error: createError } = await supabase.rpc("create_employee", {
          p_first_name: first_name,
          p_last_name: last_name,
          p_email: email,
          p_phone: phone,
          p_details: details,
        });
        if (createError) throw new Error(createError.message || "Could not create the employee.");
        createdTutorId = tutorId;
      } else {
        const tutorId = initial.tutor_id;
        if (!tutorId) throw new Error("The employee record could not be found.");
        const { phone, ...details } = validated.data;
        const { error: saveError } = await supabase.rpc("save_tutor_details", {
          p_tutor_id: tutorId,
          p_phone: phone,
          p_details: details,
        });
        if (saveError) throw new Error(saveError.message || "Could not save employee details.");
      }
      if (creation) {
        if (!createdTutorId) throw new Error("Could not create the employee.");
        router.push(`/admin/employees/${createdTutorId}`);
      } else {
        const normalized = valuesFrom({ ...initial, ...validated.data });
        setValues(normalized);
        setSaved(normalized);
        setEditing(false);
        setMessage("Your changes have been saved.");
      }
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save employee details.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-6" autoComplete="off">
      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Employee Details</h2>
        {!editing && (
          <Button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage(null);
            }}
          >
            Edit
          </Button>
        )}
      </div>
      <fieldset disabled={saving || !editing} className="space-y-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { key: "first_name", label: "First name" },
            { key: "last_name", label: "Last name" },
            { key: "email", label: "Email" },
          ].map((field) => (
            <Field key={field.key}>
              <FieldLabel htmlFor={field.key}>
                {field.label}
                {creation && <span className="text-red-500">*</span>}
              </FieldLabel>
              <Input
                id={field.key}
                value={values[field.key]}
                disabled={!creation || saving}
                readOnly={!creation}
                required={creation}
                type={field.key === "email" ? "email" : "text"}
                maxLength={field.key === "email" ? 254 : 100}
                onChange={(event) => setValue(field.key, event.target.value)}
              />
            </Field>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {creation
            ? "Name and email cannot be edited after creation. Other details can be completed later. Creating an employee does not create their login account."
            : "Name and email are read-only."}
        </p>
        {sections.map((section) => (
          <section key={section.title} className="space-y-5">
            <h3 className="text-xl font-bold">{section.title}</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {section.fields.map((field) => {
                const readOnly = mode === "self" && !!field.adminOnly;
                return (
                  <Field
                    key={field.key}
                    className={
                      field.type === "textarea"
                        ? "md:col-span-2 xl:col-span-4"
                        : undefined
                    }
                  >
                    <FieldLabel htmlFor={field.key}>
                      {field.label}
                      {(field.key === "phone" || field.key === "job") && (
                        <span className="text-red-500">*</span>
                      )}
                    </FieldLabel>
                    {field.key === "job" ? (
                      <Select
                        value={values.job}
                        onValueChange={(value) => setValue("job", value)}
                        disabled={!editing || readOnly || saving}
                      >
                        <SelectTrigger id="job">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYEE_ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "gender" ? (
                      <select
                        id={field.key}
                        disabled={!editing || saving}
                        value={values[field.key]}
                        onChange={(event) =>
                          setValue(field.key, event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-input bg-primary-foreground px-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Not specified</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={field.key}
                        disabled={!editing || saving}
                        rows={3}
                        maxLength={field.max}
                        value={values[field.key]}
                        onChange={(event) =>
                          setValue(field.key, event.target.value)
                        }
                        className="w-full rounded-md border border-input bg-primary-foreground px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type ?? "text"}
                        value={values[field.key]}
                        disabled={!editing || readOnly || saving}
                        readOnly={readOnly}
                        required={field.key === "phone" || field.key === "job"}
                        maxLength={field.max ?? 200}
                        min={field.type === "number" ? "0" : undefined}
                        step={field.type === "number" ? "0.01" : undefined}
                        onChange={(event) =>
                          setValue(field.key, event.target.value)
                        }
                      />
                    )}
                    {readOnly && (
                      <p className="text-xs text-muted-foreground">
                        Managed by your administrator.
                      </p>
                    )}
                    {field.key === "job" && editing && !readOnly && (
                      <p className="text-xs text-muted-foreground">
                        Determines the linked account’s access.
                      </p>
                    )}
                  </Field>
                );
              })}
            </div>
          </section>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {editing && (
          <>
            <Button disabled={saving} type="submit">
              {saving
                ? "Saving..."
                : creation
                  ? "Add employee"
                  : "Save changes"}
            </Button>
            <Button
              disabled={saving}
              type="button"
              variant="outline"
              onClick={() => {
                setValues({ ...saved });
                setError(null);
                setMessage(null);
                if (!creation) setEditing(false);
              }}
            >
              {creation ? "Reset" : "Cancel"}
            </Button>
          </>
        )}
        {mode === "self" && (
          <Button variant="link" asChild>
            <Link href="/auth/update-password">Change password</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
