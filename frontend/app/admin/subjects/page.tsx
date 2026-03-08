"use client";

import { useState, useEffect } from "react";
import { useAsync } from "@/hooks/use-async";
import SubjectsList from "./_components/subjects-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubjectOffering } from "@/types/IApiWrapper";
import SubjectDialog from "./_components/subject-dialog";
import { Label } from "@/components/ui/label";
import apiWrapper from "@/lib/apiWrapper";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";
import { LoadingBar } from "@/components/loading-bar";

const CreateSubjectPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOffering | null>(
    null,
  );
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [subjectOfferings, setSubjectOfferings] = useState<SubjectOffering[]>(
    [],
  );
  const { run, isPending } = useAsync();

  useEffect(() => {
    async function fetchSelectableFieldsData() {
      const fetchedLocations = await apiWrapper.getLocationsAsync();
      setLocationOptions([...fetchedLocations, "all"]);
    }
    fetchSelectableFieldsData();

    const handleQuery = async () => {
      const data = await apiWrapper.getSubjectOfferingsAsync();
      setSubjectOfferings(data);
    };

    run(handleQuery);
  }, [run]);

  const handleAdd = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleSave = (data: {
    subjectName: string;
    grade: string;
    pricePerTerm: string;
    location: string;
  }) => {
    console.log("Save subject:", data);
    setDialogOpen(false);
    fetchSubjects();
  };

  const handleEdit = (subject: SubjectOffering) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const filteredSubjects =
    selectedLocation === "all"
      ? subjectOfferings
      : subjectOfferings.filter((s) => s.location === selectedLocation);

  return (
    <div className="gap-y-4">
      <LoadingBar isLoading={isPending} />

      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Label>Location:</Label>
          <SelectLocation
            options={locationOptions}
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value)}
          />
        </div>
        <div className="flex justify-end py-4">
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="size-4" />
            Add Subject
          </Button>
        </div>
      </div>

      <SubjectsList
        locationFilter={selectedLocation}
        subjectOfferings={filteredSubjects}
        onEdit={handleEdit}
      />

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
