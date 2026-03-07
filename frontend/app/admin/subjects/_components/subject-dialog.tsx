"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as zod from "zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";
import apiWrapper from "@/lib/apiWrapper";
import { Location } from "@/types/IApiWrapper";

import { SubjectOffering } from "@/types/IApiWrapper";

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: SubjectOffering | null;
  onSave: (data: {
    subjectName: string;
    grade: string;
    pricePerTerm: string;
    location: string;
  }) => void;
}

const subjectFormSchema = zod.object({
  subjectName: zod.string().min(1, "Subject is required"),
  grade: zod.string().refine(
    (value) => {
      const parsed = parseInt(value, 10);
      return !isNaN(parsed) && parsed >= 1 && parsed <= 12;
    },
    { message: "Grade must be between 1 and 12" },
  ),
  pricePerTerm: zod.string().refine(
    (value) => {
      const parsed = parseInt(value, 10);
      return !isNaN(parsed) && parsed >= 0;
    },
    { message: "Price must be 0 or greater" },
  ),
  location: zod.string().nonempty("Location is required"),
});

const SubjectDialog = ({
  open,
  onOpenChange,
  subject,
  onSave,
}: SubjectDialogProps) => {
  const form = useForm<zod.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      subjectName: "",
      grade: "",
      pricePerTerm: "",
      location: "",
    },
  });

  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSelectableFieldsData() {
      const fetchedLocations = await apiWrapper.getLocationsAsync();
      setLocationOptions(fetchedLocations);
    }
    fetchSelectableFieldsData();

    if (subject && open) {
      // form.reset({
      //   subjectName: subject.subject_name,
      //   grade: subject.grade,
      //   pricePerTerm: Number(subject.price_per_term),
      // });
    } else if (open) {
      form.reset();
    }
  }, [subject, open, form]);

  const onSubmit = async (data: zod.infer<typeof subjectFormSchema>) => {
    // TODO: call API to create subject offering with selected location
    await apiWrapper.createSubjectAsync({
      subject_name: data.subjectName,
      grade: data.grade as number,
      location: data.location as Location,
      price_per_term: data.pricePerTerm as number,
    });
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {subject ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="subject-data-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Subject Name */}
          <Controller
            name="subjectName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="subject-name">
                  Subject Name
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="subject-name"
                  placeholder="e.g. Mathematics Extension 1, Biology, Selective"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Grade */}
          <Controller
            name="grade"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="subject-grade">
                  Grade
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input id="subject-grade" type="number" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Location */}
          <Controller
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-location">
                  Location
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <SelectLocation
                  values={locationOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Price per Term */}
          <Controller
            name="pricePerTerm"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="subject-price-per-term">
                  Price per Term ($)
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input id="subject-price-per-term" type="number" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="subject-data-form">
              {subject ? "Save Changes" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDialog;
