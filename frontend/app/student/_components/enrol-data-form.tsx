"use client";

import React, { useImperativeHandle, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { useAsync } from "@/hooks/use-async";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { SelectClass } from "@/components/_reusable-form-components/select-class";
import { SelectTerm } from "@/components/_reusable-form-components/select-term";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Field, FieldError } from "@/components/ui/field";
import { enrolmentService, termService } from "@/lib/services";
import { toast } from "sonner";
import { Term } from "@/lib/api/types";
export interface EnrolmentData {
  studentId: string;
  classId: string;
  termId: string;
}

export interface EnrolDataFormHandle {
  submit: () => void;
}

interface EnrolDataFormProps {
  studentId?: string;
  // classId?: string; // Maybe if adding from class UI
  afterSubmit?: () => void;
  ref?: React.Ref<EnrolDataFormHandle>;
}

export default function EnrolDataForm({
  studentId,
  afterSubmit,
  ref,
}: EnrolDataFormProps) {
  // isEditing?
  // disabled student selection, if passed in from prop

  const [allTerms, setAllTerms] = useState([]);

  const { run, isPending } = useAsync();

  const formSchema = zod.object({
    classId: zod.string().nonempty("Class is required"),
    termId: zod.string().nonempty("Term is required"),
  });

  // Do all classes always run every term?
  // TODO: autoset to the current term
  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: "",
      termId: "",
    },
  });

  async function onSubmit(data: zod.infer<typeof formSchema>) {
    console.log({ formData: data });
    toast.success("Successfully enrolled student in class");
    afterSubmit?.();
  }

  useImperativeHandle(ref, () => ({
    submit() {
      form.handleSubmit((data) => {
        run(async () => {
          await enrolmentService.enrolAsync({
            studentId: studentId!,
            classId: data.classId,
            termId: data.termId,
          });

          // try-catch
          // if no errors, then call onSubmit
          onSubmit(data);
        });
      })();
    },
  }));

  const onTermChange = async (termData: Partial<Term>) => {
    console.log({ termData });

    if(!termData.term_id) {
      await termService.createTermAsync({
        year: termData.year!,
        name: termData.name!,
        start_date: termData.start_date!,
        end_date: termData.end_date!,
      });
    }
    
    await termService.updateTermAsync(termData.term_id!, {
      start_date: termData.start_date!,
      end_date: termData.end_date!,
    });
  };

  return (
    <div>
      <form id="enrol-data-form" className="w-full flex flex-col gap-4">
        <div className="flex gap-2 items-center w-full">
          <span className="shrink-0">Class:</span>
          <div className="flex-1 min-w-0">
            <Controller
              name="classId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="flex">
                  <SelectClass value={field.value} onChange={field.onChange} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center w-full">
          <div className="flex-1 min-w-0">
            <Controller
              name="termId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="flex">
                  <SelectTerm
                    value={field.value}
                    onChange={onTermChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
