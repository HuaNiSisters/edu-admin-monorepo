import React, { useState } from "react";
import { SubjectOffering } from "@/types/IApiWrapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubjectDialogProps {
  key: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: SubjectOffering | null;
  onSave: () => void;
}

const SubjectDialog = ({
  key,
  open,
  onOpenChange,
  subject,
  onSave,
}: SubjectDialogProps) => {
  const [name, setName] = useState(subject?.subject_id ?? "");
  const [grade, setGrade] = useState(subject?.grade_id ?? "");
  const [price, setPrice] = useState(subject?.price_per_term ?? "");

  const isEditing = !!subject;
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setName("");
      setGrade("");
      setPrice("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the subject details below."
              : "Fill in the details to add a new subject."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
          // onClick={handleSave}
          // disabled={!name.trim() || !grade || !price.trim()}
          >
            {isEditing ? "Save Changes" : "Add Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDialog;
