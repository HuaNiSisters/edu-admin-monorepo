"use client";

import { useState, useEffect } from "react";
import SubjectsList from "./_components/subjects-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubjectOffering } from "@/types/IApiWrapper";
import SubjectDialog from "./_components/subject-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import apiWrapper from "@/lib/apiWrapper";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";

const LOCATIONS = [
  { label: "Parramatta", value: "parramatta" },
  { label: "Cabramatta & Canley Vale", value: "cabramatta_and_canley_vale" },
  { label: "Online", value: "online" },
];

const CreateSubjectPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOffering | null>(
    null,
  );
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<string>("parramatta");

  useEffect(() => {
    async function fetchSelectableFieldsData() {
      const fetchedLocations = await apiWrapper.getLocationsAsync();
      setLocationOptions(fetchedLocations);
    }
    fetchSelectableFieldsData();
  }, []);
  const handleAdd = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleSave = (data: {
    subjectName: string;
    grade: string;
    price: string;
    location: string;
  }) => {
    console.log("Save subject:", data);
    // Ensure new subject appears on list
    setDialogOpen(false);
  };

  return (
    <div className="gap-y-4">
      {/* Location Filter */}
      <div className="flex items-center gap-2">
        <Label>Filter by Location:</Label>
        <SelectLocation
          values={locationOptions}
          value={selectedLocation}
          onChange={() => setSelectedLocation(selectedLocation)}
        />
      </div>

      {/* Add Subject Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>

      {/* Subjects List filtered by location */}
      <SubjectsList locationFilter={selectedLocation} />

      {/* Dialog */}
      <SubjectDialog
        key={editingSubject?.subject_id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editingSubject}
        onSave={(data) => handleSave({ ...data })}
      />
    </div>
  );
};

export default CreateSubjectPage;
