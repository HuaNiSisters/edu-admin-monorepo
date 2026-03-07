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
import {
  Location,
  StudentStatus,
  Gender,
  StudentData,
} from "@/types/IApiWrapper";
import { SelectGender } from "./select-gender";
import { toast } from "sonner";

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
    return !isNaN(parsed) && parsed >= 1 && parsed <= 12;
  }),
  school: zod.string().min(1, "School is required"),
  suburb: zod.string().min(1, "Suburb is required"),
  location: zod.string().nonempty("Location is required"),
  status: zod.string().nonempty("Status is required"),
  notes: zod.string().optional(),
  mobile: zod.string().min(1, "Mobile number is required"),
});

const StudentDataForm = ({ studentData, isEditing }: { studentData?: StudentData; isEditing?: boolean }) => {
  const isEditMode = !!studentData && isEditing;

  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    const {
      student_id,
      first_name,
      last_name,
      preferred_name,
      gender,
      email,
      grade_at_school,
      school,
      location,
      status,
      notes,
      student_mobile,
      suburb_of_home,
    } = studentData || {};
    setStudentId(student_id || "");
    form.setValue("firstName", first_name || "");
    form.setValue("lastName", last_name || "");
    form.setValue("preferredName", preferred_name || "");
    form.setValue("gender", gender || "");
    form.setValue("email", email || "");
    form.setValue("grade", grade_at_school ? grade_at_school.toString() : "");
    form.setValue("school", school || "");
    form.setValue("location", location || "");
    form.setValue("status", status || "");
    form.setValue("notes", notes || "");
    form.setValue("mobile", student_mobile || "");
    form.setValue("suburb", suburb_of_home || "");
  }, [studentData]);

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
      mobile: "",
      suburb: "",
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
    if (form.formState.isSubmitSuccessful && !isEditMode) {
      form.reset();
    }
  }, [form.formState.isSubmitSuccessful, form.reset, isEditMode]);

  async function onSubmit(data: zod.infer<typeof formSchema>) {
    if(isEditMode) {
      await apiWrapper.updateStudentAsync(studentId, {
        first_name: data.firstName,
        last_name: data.lastName,
        preferred_name: data.preferredName,
        gender: data.gender as Gender,
        email: data.email,
        grade_at_school: parseInt(data.grade),
        school: data.school,
        location: data.location as Location,
        status: data.status as StudentStatus,
        notes: data.notes,
        suburb_of_home: data.suburb,
        student_mobile: data.mobile,
      });
      
      toast.success("Student updated successfully!", { position: "top-center" });
      return;
    }

    await apiWrapper.createStudentAsync({
      first_name: data.firstName,
      last_name: data.lastName,
      preferred_name: data.preferredName,
      gender: data.gender as Gender,
      email: data.email,
      grade_at_school: parseInt(data.grade),
      school: data.school,
      location: data.location as Location,
      status: data.status as StudentStatus,
      notes: data.notes,
      suburb_of_home: data.suburb,
      student_mobile: data.mobile,
    });
    toast.success("Student created successfully!", { position: "top-center" });
    return;
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

export default StudentDataForm;
