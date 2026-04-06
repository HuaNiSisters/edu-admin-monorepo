"use client";

import { MultiSelectCombobox } from "@/components/multi-select-combobox";
import React from "react";

const AttendancePage = () => {
  const [selectedGrades, setSelectedGrades] = React.useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);

  return (
    <div>
      <MultiSelectCombobox
        options={[
          { label: "Year 5", value: "5" },
          { label: "Year 8", value: "8" },
          { label: "Year 9", value: "9" },
        ]}
        placeholder="Select grades..."
        value={selectedGrades}
        onChange={setSelectedGrades}
      />

      {/* <MultiSelectCombobox
        options={subjectOfferings.map((s) => ({
          label: getSubjectLabel(s),
          value: s.subject_id,
        }))}
        placeholder="Select subjects..."
        value={selectedSubjects}
        onChange={setSelectedSubjects}
      /> */}
    </div>
  );
};

export default AttendancePage;
