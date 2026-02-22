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

// TODO: Is it possible for the subject dropdown options to change, depending on the grade put in
// e.g. Y11 and Y12 should show Biology, Chemistry, Physics but another grade shouldn't

const formSchema = zod.object({
  day_of_week: zod.string().nonempty("Day of week is required"),
  grade: zod.string().nonempty("Grade is required"),
  subject: zod.string().nonempty("Subject is required"),
  start_time: zod.string().nonempty("Start time is required"),
  end_time: zod.string().nonempty("End time is required"),
  location: zod.string().nonempty("Location is required"),
  tutor: zod.string().nonempty("Tutor is required"),
});

const ClassDataForm = () => {
  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day_of_week: "",
      grade: "",
      subject: "",
      start_time: "",
      end_time: "",
      location: "",
      tutor: "",
      //   status: "Active",
      //   capacity: 0,
    },
  });

  //   const [locationOptions, setLocationOptions] = useState<string[]>([]);
  //   const [statusOptions, setStatusOptions] = useState<string[]>([]);
  //   const [genderOptions, setGenderOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSelectableFieldsData() {
      //   const fetchedLocations = await apiWrapper.getLocationsAsync();
      //   const fetchedStatuses = await apiWrapper.getStatusesAsync();
      //   const fetchedGenders = await apiWrapper.getGendersAsync();
      //   setLocationOptions(fetchedLocations);
      //   setStatusOptions(fetchedStatuses);
      //   setGenderOptions(fetchedGenders);
    }
    fetchSelectableFieldsData();
  }, []);

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
    }
  }, [form.formState.isSubmitSuccessful, form.reset]);

  async function onSubmit(data: zod.infer<typeof formSchema>) {
    await apiWrapper.createClassAsync({
      day_of_week: data.day_of_week,
      grade: data.grade,
      subject: data.subject,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      tutor: data.tutor,
      status: "Active",
      capacity: 0,
      //   first_name: data.firstName,
      //   last_name: data.lastName,
      //   preferred_name: data.preferredName,
      //   gender: data.gender as Gender,
      //   email: data.email,
      //   grade_at_school: data.grade as number,
      //   school: data.school,
      //   location: data.location as Location,
      //   status: data.status as StudentStatus,
      //   notes: data.notes,
      //   suburb_of_home: data.suburb,
      //   student_mobile: data.mobile,
    });
  }

  return (
    <form
      id="student-data-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full"
    >
      <div className="grid grid-cols-2 gap-5">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-name">
                First name
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="student-name"
                placeholder="Student's First Name"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-last-name">
                Last name
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="student-last-name"
                placeholder="Student's Last Name"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="gender"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-gender">
                Gender
                <span className="text-red-500">*</span>
              </FieldLabel>
              <SelectGender
                values={genderOptions}
                value={field.value}
                onChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="grade"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-grade">
                Grade at school
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input id="student-grade" type="number" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="school"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-school">
                School
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input id="student-school" type="text" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="suburb"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-suburb">
                Suburb
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input id="student-suburb" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-status">
                Status
                <span className="text-red-500">*</span>
              </FieldLabel>
              <SelectStatus
                values={statusOptions}
                value={field.value}
                onChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div></div>

        <Controller
          name="mobile"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-mobile">
                Mobile
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="student-mobile"
                placeholder="Student's Mobile Number"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="student-email">
                Email
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input id="student-email" type="email" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="py-5">
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="py-5">
        <Field orientation="horizontal">
          <Button type="submit" form="student-data-form">
            Submit
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </Field>
      </div>
    </form>
  );
};

export default ClassDataForm;
