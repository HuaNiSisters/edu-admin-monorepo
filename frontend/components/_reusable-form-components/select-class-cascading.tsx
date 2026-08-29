"use client";

import { useEffect, useState } from "react";

import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { classService } from "@/lib/services";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const isNonEmptyString = (value: string | null | undefined): value is string =>
  Boolean(value);

const toSelectValue = (value: string | number | null | undefined) =>
  value == null ? "" : String(value);

const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const compareGrades = (first: string, second: string) => {
  const firstNumber = Number(first);
  const secondNumber = Number(second);

  if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
    return firstNumber - secondNumber;
  }

  return first.localeCompare(second, undefined, { numeric: true });
};

const compareClassesChronologically = (
  first: ClassTimeWithSubjectAndTutor,
  second: ClassTimeWithSubjectAndTutor,
) => {
  const firstDayIndex = dayOrder.indexOf(first.day_of_week.toLowerCase());
  const secondDayIndex = dayOrder.indexOf(second.day_of_week.toLowerCase());
  const firstDay = firstDayIndex === -1 ? dayOrder.length : firstDayIndex;
  const secondDay = secondDayIndex === -1 ? dayOrder.length : secondDayIndex;
  const dayDifference = firstDay - secondDay;

  if (dayDifference !== 0) return dayDifference;

  if (firstDayIndex === -1) {
    const namedDayDifference = first.day_of_week.localeCompare(
      second.day_of_week,
    );
    if (namedDayDifference !== 0) return namedDayDifference;
  }

  return first.start_time.localeCompare(second.start_time, undefined, {
    numeric: true,
  });
};

interface SelectClassCascadingProps {
  /** Selected class_id. */
  value: string;
  onChange: (classId: string) => void;
  disabled?: boolean;
}

/**
 * Cascading class picker: Grade -> Subject -> Location -> Class.
 * Each step filters down to the matching set of existing classes.
 *
 * Shared by the "Add class" section on the create-student form and the
 * "Enrol in a class" dialog, so both follow the same selection workflow.
 */
export function SelectClassCascading({
  value,
  onChange,
  disabled,
}: SelectClassCascadingProps) {
  const [classes, setClasses] = useState<ClassTimeWithSubjectAndTutor[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    classService.getClassTimesAsync().then(setClasses);
  }, []);

  // If a class is already selected (e.g. editing an existing enrolment),
  // backfill the grade/subject/location steps so the cascade stays in sync.
  useEffect(() => {
    if (!value || classes.length === 0) return;
    const matchedClass = classes.find(
      (classTime) => classTime.class_id === value,
    );
    if (!matchedClass) return;
    setSelectedGrade((prev) => prev || toSelectValue(matchedClass.grade));
    setSelectedSubject((prev) => prev || matchedClass.subject_name || "");
    setSelectedLocation((prev) => prev || matchedClass.location || "");
  }, [value, classes]);

  const grades = Array.from(
    new Set(
      classes
        .map((classTime) => toSelectValue(classTime.grade))
        .filter(isNonEmptyString),
    ),
  ).sort(compareGrades);

  const subjects = Array.from(
    new Set(
      classes
        .filter((classTime) => toSelectValue(classTime.grade) === selectedGrade)
        .map((classTime) => classTime.subject_name)
        .filter(isNonEmptyString),
    ),
  ).sort((first, second) => first.localeCompare(second));
  
  const locations = Array.from(
    new Set(
      classes
        .filter(
          (classTime) =>
            toSelectValue(classTime.grade) === selectedGrade &&
            classTime.subject_name === selectedSubject,
        )
        .map((classTime) => classTime.location)
        .filter(isNonEmptyString),
    ),
  ).sort((first, second) => first.localeCompare(second));

  const matchingClasses = classes
    .filter(
      (classTime) =>
        toSelectValue(classTime.grade) === selectedGrade &&
        classTime.subject_name === selectedSubject &&
        classTime.location === selectedLocation,
    )
    .sort(compareClassesChronologically);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <FieldLabel>Grade</FieldLabel>
        <Select
          value={selectedGrade}
          onValueChange={(grade) => {
            setSelectedGrade(grade);
            setSelectedSubject("");
            setSelectedLocation("");
            onChange("");
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <FieldLabel>Subject</FieldLabel>
        <Select
          value={selectedSubject}
          onValueChange={(subject) => {
            setSelectedSubject(subject);
            setSelectedLocation("");
            onChange("");
          }}
          disabled={disabled || !selectedGrade}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <FieldLabel>Location</FieldLabel>
        <Select
          value={selectedLocation}
          onValueChange={(location) => {
            setSelectedLocation(location);
            onChange("");
          }}
          disabled={disabled || !selectedSubject}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {formatValuesRemoveUnderscores(location)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <FieldLabel>Class</FieldLabel>
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled || !selectedLocation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {matchingClasses.map((classTime) => (
              <SelectItem key={classTime.class_id} value={classTime.class_id}>
                {classTime.day_of_week} {classTime.start_time}–
                {classTime.end_time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
