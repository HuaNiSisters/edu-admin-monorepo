"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { formatPhoneNumber } from "@/utils/phone-utils";
import { createClient } from "@/lib/api/supabase/client";
import {
  createEmployeeSchema,
  createEmployeeRequiredSchema,
  employeeCreationInput,
  EMPLOYEE_ROLE_OPTIONS,
} from "@/lib/employees/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Values = z.infer<typeof createEmployeeRequiredSchema>;
const defaults: Values = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job: "tutor",
};
const fields = [
  {
    name: "first_name",
    label: "First name",
    type: "text",
    max: 100,
    autoComplete: "given-name",
  },
  {
    name: "last_name",
    label: "Last name",
    type: "text",
    max: 100,
    autoComplete: "family-name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    max: 254,
    autoComplete: "email",
  },
  { name: "phone", label: "Mobile", type: "tel", max: 40, autoComplete: "tel" },
] as const;

export function EmployeeDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(createEmployeeRequiredSchema),
    defaultValues: defaults,
  });
  const [error, setError] = useState<string | null>(null);
  const saving = form.formState.isSubmitting;

  useEffect(() => {
    if (open) {
      form.reset(defaults);
      setError(null);
    }
  }, [open, form]);

  async function submit(values: Values) {
    setError(null);
    try {
      const validated = createEmployeeSchema.safeParse(employeeCreationInput(values));
      if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? "Check the employee details.");
      }
      const { first_name, last_name, email, phone, ...details } = validated.data;
      const { data: tutorId, error: createError } = await createClient().rpc("create_employee", {
        p_first_name: first_name,
        p_last_name: last_name,
        p_email: email,
        p_phone: phone,
        p_details: details,
      });
      if (createError) throw new Error(createError.message || "Could not create the employee.");
      if (!tutorId) throw new Error("Could not create the employee.");
      onOpenChange(false);
      toast.success("Employee created successfully!", {
        position: "top-center",
      });
      onCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create the employee.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) onOpenChange(value);
      }}
    >
      <DialogContent
        className="sm:max-w-md max-h-[90dvh] overflow-y-auto"
        showCloseButton={!saving}
      >
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>
            Name and email cannot be changed later.
          </DialogDescription>
        </DialogHeader>
        <form
          id="employee-data-form"
          onSubmit={form.handleSubmit(submit)}
          className="space-y-4"
          noValidate
        >
          <fieldset disabled={saving} className="space-y-4">
            {fields.map((config) => (
              <Controller
                key={config.name}
                name={config.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={`employee-${config.name}`}>
                      {config.label}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    </FieldLabel>
                    <Input
                      id={`employee-${config.name}`}
                      type={config.type}
                      maxLength={config.max}
                      autoComplete={config.autoComplete}
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid
                          ? `employee-${config.name}-error`
                          : undefined
                      }
                      {...field}
                      value={
                        config.name === "phone"
                          ? formatPhoneNumber(field.value)
                          : field.value
                      }
                      onChange={(event) =>
                        field.onChange(
                          config.name === "phone"
                            ? formatPhoneNumber(event.target.value)
                            : event.target.value,
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError
                        id={`employee-${config.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            ))}
            <Controller
              name="job"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="employee-job">
                    Job
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={saving}
                  >
                    <SelectTrigger
                      id="employee-job"
                      ref={field.ref}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
