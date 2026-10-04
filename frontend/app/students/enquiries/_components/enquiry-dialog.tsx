"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENQUIRY_CAMPUSES, Enquiry } from "@/lib/api/types/enquiry";
import { enquiryDefaults, enquiryFormSchema, EnquiryFormValues } from "@/lib/validation/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";

const fields: { name: keyof EnquiryFormValues; label: string; required?: boolean; type?: string; placeholder?: string }[] = [
  { name: "first_name", label: "First Name", required: true },
  { name: "surname", label: "Last Name", required: true },
  { name: "parent_phone_number", label: "Parent Mobile", required: true, type: "tel" },
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

export default function EnquiryDialog({ open, onOpenChange, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (enquiry: Enquiry) => void;
}) {
  const form = useForm<EnquiryFormValues>({ resolver: zodResolver(enquiryFormSchema), defaultValues: enquiryDefaults });
  const { isSubmitting } = form.formState;
  useEffect(() => { if (open) form.reset(enquiryDefaults); }, [open, form]);

  async function onSubmit(values: EnquiryFormValues) {
    form.clearErrors("root");
    try {
      const enquiry = await enquiryService.create(values);
      onSave(enquiry);
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Unable to create enquiry. Please try again." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => { if (!isSubmitting) onOpenChange(value); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" showCloseButton={!isSubmitting}>
        <DialogHeader><DialogTitle>New Enquiry</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                      required={required} aria-required={required} aria-invalid={fieldState.invalid} disabled={isSubmitting}
                      {...(name === "grade" ? { min: 1, max: 12, step: 1 } : {})} />
                  )}
                  {name === "subject_selection" && <p className="text-xs text-muted-foreground">Separate multiple subjects with commas.</p>}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
            ))}
          </div>
          {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create Enquiry"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
