"use client";

import { useEffect, useState } from "react";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import {
  ClassTimeWithSubjectAndTutor,
  SubjectOffering,
  EmployeeInfo,
} from "@/types/IApiWrapper";
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
    tutor: zod.string().optional(),
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
  classTime?: ClassTimeWithSubjectAndTutor | null;
  subjectOfferings: SubjectOffering[];
  tutors: EmployeeInfo[];
  onSave: (data: {
    offering_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    tutor_id: string | null;
    capacity: number | null;
    active: boolean;
  }) => void;
}

const getSubjectLabel = (s: SubjectOffering) =>
  `${s.subject_name} - Grade ${s.grade}${s.location ? ` (${formatValuesRemoveUnderscores(s.location)})` : ""}`;

const ClassDialog = ({
  open,
  onOpenChange,
  classTime,
  subjectOfferings,
  tutors,
  onSave,
}: ClassDialogProps) => {
  const isEditing = !!classTime;
  const [subjectSearch, setSubjectSearch] = useState("");
  const [tutorsSearch, setTutorsSearch] = useState("");
  const [isSelected, setIsSelected] = useState(false);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      offeringId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      tutor: "",
      capacity: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      setSubjectSearch("");
      setIsSelected(false);
      return;
    }
    if (classTime) {
      const selectedSubject = subjectOfferings.find(
        (s) => s.subject_id === classTime.offering_id,
      );
      const selectedTutor = tutors.find(
        (t) => t.tutor_id === classTime.tutor_id,
      );
      setSubjectSearch(selectedSubject ? getSubjectLabel(selectedSubject) : "");
      setTutorsSearch(
        selectedTutor
          ? `${selectedTutor.first_name} ${selectedTutor.last_name}`
          : "",
      );
      setIsSelected(true);
      form.reset({
        offeringId: classTime.offering_id ?? "",
        dayOfWeek: classTime.day_of_week ?? "",
        startTime: classTime.start_time ?? "",
        endTime: classTime.end_time ?? "",
        tutor: classTime.tutor_id ?? "",
        capacity: classTime.capacity != null ? String(classTime.capacity) : "",
        active: classTime.active ?? true,
      });
    } else {
      setSubjectSearch("");
      form.reset({
        offeringId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        capacity: "",
        active: true,
      });
    }
  }, [classTime, open, form, subjectOfferings]);

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

  const filteredOfferings = subjectOfferings.filter((s) =>
    isSelected
      ? true
      : getSubjectLabel(s).toLowerCase().includes(subjectSearch.toLowerCase()),
  );

  const filteredTutors = tutors.filter((t) =>
    isSelected
      ? true
      : t.first_name.toLowerCase().includes(tutorsSearch.toLowerCase()) &&
        t.last_name.toLowerCase().includes(tutorsSearch.toLowerCase()),
  );

  const onSubmit = async (data: ClassFormValues) => {
    const newClassTime = {
      offering_id: data.offeringId,
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
      tutor_id: data.tutor || null,
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
          onSubmit={(e) => {
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }}
          className="grid gap-4 py-2"
        >
          {/* Subject Offering */}
          <Controller
            name="offeringId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="offering">Subject</FieldLabel>
                <Combobox
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value ?? "");
                    const selected = subjectOfferings.find(
                      (s) => s.subject_id === value,
                    );
                    setSubjectSearch(selected ? getSubjectLabel(selected) : "");
                    setIsSelected(true);
                  }}
                >
                  <ComboboxInput
                    placeholder="Search or select a subject..."
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setIsSelected(false);
                    }}
                  />
                  <ComboboxContent className="pointer-events-auto">
                    <ComboboxList>
                      {filteredOfferings.length === 0 ? (
                        <div className="p-1 text-center text-sm text-muted-foreground">
                          No subjects found.
                        </div>
                      ) : (
                        filteredOfferings.map((s) => (
                          <ComboboxItem
                            key={s.subject_id}
                            value={s.subject_id}
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          >
                            {getSubjectLabel(s)}
                          </ComboboxItem>
                        ))
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
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

          {/* Tutor */}
          <Controller
            name="tutor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="tutor">Tutor (optional)</FieldLabel>
                <Combobox
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value ?? "");
                    const selected = tutors.find((s) => s.tutor_id === value);
                    setTutorsSearch(
                      selected
                        ? `${selected.first_name} ${selected.last_name}`
                        : "",
                    );
                    setIsSelected(true);
                  }}
                >
                  <ComboboxInput
                    placeholder="Search or select a tutor..."
                    value={tutorsSearch}
                    onChange={(e) => {
                      setTutorsSearch(e.target.value);
                      setIsSelected(false);
                    }}
                  />
                  <ComboboxContent className="pointer-events-auto">
                    <ComboboxList>
                      {filteredTutors.length === 0 ? (
                        <div className="p-1 text-center text-sm text-muted-foreground">
                          No tutors found.
                        </div>
                      ) : (
                        filteredTutors.map((tutor) => (
                          <ComboboxItem
                            key={tutor.tutor_id}
                            value={tutor.tutor_id}
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          >
                            {tutor.first_name} {tutor.last_name}
                          </ComboboxItem>
                        ))
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
