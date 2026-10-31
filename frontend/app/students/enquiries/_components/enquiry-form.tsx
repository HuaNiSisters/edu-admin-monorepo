"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENQUIRY_CAMPUSES } from "@/lib/api/types/enquiry";
import { enquiryDefaults, enquiryFormSchema, EnquiryFormValues } from "@/lib/validation/enquiry";
import { formatPhoneNumber } from "@/utils/phone-utils";

const fields: { name: keyof EnquiryFormValues; label: string; required?: boolean; type?: string; placeholder?: string }[] = [
  { name: "first_name", label: "First Name", required: true },
  { name: "surname", label: "Last Name", required: true },
  { name: "parent_phone_number", label: "Parent Mobile", required: true, type: "tel" },
  { name: "parent_2_phone_number", label: "Parent 2 Mobile", type: "tel" },
  { name: "parent_name", label: "Parent Name" },
  { name: "school", label: "School", required: true },
  { name: "grade", label: "Grade", required: true, type: "number" },
  { name: "subject_selection", label: "Subject Selection", required: true, placeholder: "e.g. Biology, Mathematics" },
  { name: "suburb_of_home", label: "Suburb of Home", required: true },
  { name: "gender", label: "Gender" },
  { name: "student_phone_number", label: "Student Mobile", type: "tel" },
  { name: "email_address", label: "Email Address", type: "email" },
  { name: "preferred_campus", label: "Preferred Campus" },
  { name: "preferred_class_days_times", label: "Preferred Class Days / Times" },
  { name: "hear_about_us", label: "Hear about us" },
  { name: "reference", label: "Reference" },
  { name: "additional_comments", label: "Additional Comments / Questions" },
];

export function enquiryToFormValues(enquiry: import("@/lib/api/types/enquiry").Enquiry): EnquiryFormValues {
  return {
    first_name: enquiry.first_name,
    surname: enquiry.surname,
    parent_phone_number: enquiry.parent_phone_number ?? "",
    parent_2_phone_number: enquiry.parent_2_phone_number ?? "",
    school: enquiry.school ?? "",
    grade: String(enquiry.grade ?? ""),
    subject_selection: enquiry.subject_selection?.join(", ") ?? "",
    suburb_of_home: enquiry.suburb_of_home ?? "",
    gender: enquiry.gender ?? "",
    student_phone_number: enquiry.student_phone_number ?? "",
    email_address: enquiry.email_address ?? "",
    parent_name: enquiry.parent_name ?? "",
    preferred_campus: enquiry.preferred_campus ?? "",
    preferred_class_days_times: enquiry.preferred_class_days_times ?? "",
    hear_about_us: enquiry.hear_about_us ?? "",
    reference: enquiry.reference ?? "",
    additional_comments: enquiry.additional_comments ?? "",
  };
}

export default function EnquiryForm({
  initialValues = enquiryDefaults,
  submitLabel = "Save enquiry",
  onSubmit,
  onCancel,
}: {
  initialValues?: EnquiryFormValues;
  submitLabel?: string;
  onSubmit: (values: EnquiryFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const form = useForm<EnquiryFormValues>({ resolver: zodResolver(enquiryFormSchema), defaultValues: initialValues });
  const { isSubmitting } = form.formState;

  async function handleSubmit(values: EnquiryFormValues) {
    form.clearErrors("root");
    try {
      await onSubmit(values);
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Unable to save enquiry. Please try again." });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, required, type, placeholder }) => (
          <Controller key={name} name={name} control={form.control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`enquiry-${name}`}>
                {label}{required && <span className="text-red-500">*</span>}
              </FieldLabel>
              {name === "preferred_campus" ? (
                <Select value={field.value || "none"} onValueChange={value => field.onChange(value === "none" ? "" : value)} disabled={isSubmitting}>
                  <SelectTrigger id={`enquiry-${name}`} ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {ENQUIRY_CAMPUSES.map(campus => <SelectItem key={campus} value={campus}>{campus}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : name === "additional_comments" ? (
                <Textarea {...field} id={`enquiry-${name}`} disabled={isSubmitting} aria-invalid={fieldState.invalid} />
              ) : (
                <Input {...field} id={`enquiry-${name}`} type={type || "text"} placeholder={placeholder}
                  value={type === "tel" ? formatPhoneNumber(field.value) : field.value}
                  onChange={event => field.onChange(type === "tel"
                    ? formatPhoneNumber(formatPhoneNumber(event.target.value).replace(/\D/g, "").slice(0, 10))
                    : event.target.value)}
                  required={required} aria-required={required} aria-invalid={fieldState.invalid} disabled={isSubmitting}
                  {...(name === "grade" ? { min: 1, max: 12, step: 1 } : {})} />
              )}
              {name === "subject_selection" && <p className="text-xs text-muted-foreground">Separate multiple subjects with commas.</p>}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />))}
      </div>
      {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}
