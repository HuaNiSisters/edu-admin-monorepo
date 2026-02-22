"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiWrapper from "@/lib/apiWrapper";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";
import { SelectStatus } from "@/components/_reusable-form-components/select-status";
import { Location, StudentStatus, Gender } from "@/types/IApiWrapper";
import { SelectGender } from "./select-gender";

const formSchema = zod.object({
  firstName: zod.string().min(1, "First name is required"),
  lastName: zod.string().min(1, "Last name is required"),
  preferredName: zod.string().optional(),
  gender: zod.string().nonempty("Gender is required"),
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  // grade: zod.number().min(7).max(12), // Hard-coded range validation check
  grade: zod.string().refine((value) => {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed >= 7 && parsed <= 12;
  }),
  school: zod.string().min(1, "School is required"),
  location: zod.string().nonempty("Location is required"),
  status: zod.string().nonempty("Status is required"),
  notes: zod.string().optional(),
});

const StudentDataForm = () => {
  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      gender: "",
      email: "",
      grade: "",
      school: "",
      location: "",
      status: "Attending",
      notes: "",
    },
  });

  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSelectableFieldsData() {
      const fetchedLocations = await apiWrapper.getLocationsAsync();
      const fetchedStatuses = await apiWrapper.getStatusesAsync();
      const fetchedGenders = await apiWrapper.getGendersAsync();
      setLocationOptions(fetchedLocations);
      setStatusOptions(fetchedStatuses);
      setGenderOptions(fetchedGenders);
    }
    fetchSelectableFieldsData();
  }, []);

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
    }
  }, [form.formState.isSubmitSuccessful, form.reset]);

  async function onSubmit(data: zod.infer<typeof formSchema>) {
    await apiWrapper.createStudentAsync({
      first_name: data.firstName,
      last_name: data.lastName,
      preferred_name: data.preferredName,
      gender: data.gender as Gender,
      email: data.email,
      grade_at_school: data.grade as number,
      school: data.school,
      location: data.location as Location,
      status: data.status as StudentStatus,
      notes: data.notes,
      suburb_of_home: "LIVO", // TODO: Add field
      student_mobile: "0844727", // TODO: Add field
    });
  }

  return (
    <form
      id="student-data-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full"
    >
      <FieldSet>
        <FieldLegend>Student Information</FieldLegend>
        <FieldDescription>
          Please enter the student's information below.
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-name">First name</FieldLabel>
                <Input id="student-name" placeholder="First name" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-last-name">Last name</FieldLabel>
                <Input
                  id="student-last-name"
                  placeholder="Last name"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="preferredName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-preferred-name">
                  Preferred name
                </FieldLabel>
                <Input id="student-preferred-name" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-gender">Gender</FieldLabel>
                <SelectGender
                  values={genderOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-email">Email</FieldLabel>
                <Input id="student-email" type="email" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="grade"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-grade">Grade at school</FieldLabel>
                <Input id="student-grade" type="number" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="school"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-school">School</FieldLabel>
                <Input id="student-school" type="text" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-location">Location</FieldLabel>
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
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-status">Status</FieldLabel>
                <SelectStatus
                  values={statusOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-notes">Notes</FieldLabel>
                <Textarea
                  id="student-notes"
                  placeholder="Additional notes"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Field orientation="horizontal">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="student-data-form">
          Submit
        </Button>
      </Field>
    </form>
  );
};

export default StudentDataForm;
