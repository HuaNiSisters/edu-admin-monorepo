"use client";

import { useEffect } from "react";
import apiWrapper from "@/lib/apiWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClassTimeWithSubject, SubjectOffering } from "@/types/IApiWrapper";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as zod from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const classFormSchema = zod
  .object({
    offeringId: zod.string().min(1, "Subject is required"),
    dayOfWeek: zod.string().min(1, "Day is required"),
    startTime: zod.string().min(1, "Start time is required"),
    endTime: zod.string().min(1, "End time is required"),
    capacity: zod.string(),
    active: zod.boolean(),
  })
  .refine(
    (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type ClassFormValues = zod.infer<typeof classFormSchema>;

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classTime?: ClassTimeWithSubject | null;
  subjectOfferings: SubjectOffering[];
  onSave: (data: {
    offering_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number | null;
    active: boolean;
  }) => void;
}

const ClassDialog = ({
  open,
  onOpenChange,
  classTime,
  subjectOfferings,
  onSave,
}: ClassDialogProps) => {
  const isEditing = !!classTime;

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      offeringId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      capacity: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (classTime) {
      form.reset({
        offeringId: classTime.offering_id ?? "",
        dayOfWeek: classTime.day_of_week ?? "",
        startTime: classTime.start_time ?? "",
        endTime: classTime.end_time ?? "",
        capacity: classTime.capacity != null ? String(classTime.capacity) : "",
        active: classTime.active ?? true,
      });
    } else {
      form.reset({
        offeringId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        capacity: "",
        active: true,
      });
    }
  }, [classTime, open, form]);

  const handleStartTimeChange = (value: string) => {
    form.setValue("startTime", value, { shouldValidate: true });
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      const endHours = (hours + 2) % 24;
      form.setValue(
        "endTime",
        `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
        { shouldValidate: true },
      );
    }
  };

  const onSubmit = async (data: ClassFormValues) => {
    const newClassTime = {
      offering_id: data.offeringId,
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
      capacity: data.capacity !== "" ? Number(data.capacity) : null,
      active: data.active,
    };

    if (isEditing) {
      await apiWrapper.updateClassAsync(classTime.class_id, newClassTime);
    } else {
      await apiWrapper.createClassAsync(newClassTime);
    }

    onSave(newClassTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Class" : "Add Class"}</DialogTitle>
        </DialogHeader>

        <form
          id="class-data-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-2"
        >
          {/* Subject Offering */}
          <Controller
            name="offeringId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="offering">Subject</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="offering">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOfferings.map((s) => (
                      <SelectItem key={s.subject_id} value={s.subject_id}>
                        {s.subject_name} - Year {s.grade}
                        {s.location
                          ? ` (${formatValuesRemoveUnderscores(s.location)})`
                          : ""}
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

          {/* Day of Week */}
          <Controller
            name="dayOfWeek"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="day">Day of Week</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
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

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="start-time">Start Time</FieldLabel>
                  <Input
                    id="start-time"
                    type="time"
                    value={field.value}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="endTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="end-time">End Time</FieldLabel>
                  <Input id="end-time" type="time" {...field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Capacity */}
          <Controller
            name="capacity"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="capacity">Capacity (optional)</FieldLabel>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="e.g. 20"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Active toggle */}
          <Controller
            name="active"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="active">Active</FieldLabel>
              </div>
            )}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="class-data-form">
            {isEditing ? "Save Changes" : "Add Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDialog;
