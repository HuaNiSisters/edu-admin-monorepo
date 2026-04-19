"use client";

import React, { useEffect, useImperativeHandle, useState } from "react";

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
  onSubmit?: (data: EnrolmentData) => void;
  ref?: React.Ref<EnrolDataFormHandle>;
}

export default function EnrolDataForm({
  studentId,
  onSubmit,
  ref,
}: EnrolDataFormProps) {
  // isEditing?
  // disabled student selection, if passed in from prop

  
    // no validation needed

  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  useImperativeHandle(ref, () => ({
    submit() {
      // validate, then call onSubmit
      alert("submit");
      onSubmit?.({ studentId: selectedStudentId, classId: selectedClassId, termId: selectedTermId });
    },
  }));

  return (
    <div>
      <form
        id="enrol-data-form"
        // onSubmit={(e) => {
        //   e.preventDefault();
        //   alert("submit");
        //   onSubmit?.({ studentId: selectedStudentId, classId: selectedClassId, termId: selectedTermId });
        // }}
    >
        <label htmlFor="class">Class:</label>
        <input type="text" id="class" name="class" />
        <br />
        <label htmlFor="term">Term:</label>
        <input type="text" id="term" name="term" />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
