"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClassTimeWithSubject, SubjectOffering } from "@/types/IApiWrapper";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classTime?: ClassTimeWithSubject | null;
  subjectOfferings: SubjectOffering[];
  onSave: (data: {
    offering_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number | null;
    active: boolean;
  }) => void;
}

const ClassDialog = ({
  open,
  onOpenChange,
  classTime,
  subjectOfferings,
  onSave,
}: ClassDialogProps) => {
  const isEditing = !!classTime;

  const [offeringId, setOfferingId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (classTime) {
      setOfferingId(classTime.offering_id ?? "");
      setDayOfWeek(classTime.day_of_week ?? "");
      setStartTime(classTime.start_time ?? "");
      setEndTime(classTime.end_time ?? "");
      setCapacity(classTime.capacity != null ? String(classTime.capacity) : "");
      setActive(classTime.active ?? true);
    } else {
      setOfferingId("");
      setDayOfWeek("");
      setStartTime("");
      setEndTime("");
      setCapacity("");
      setActive(true);
    }
  }, [classTime, open]);

  const handleSubmit = () => {
    if (!offeringId || !dayOfWeek || !startTime || !endTime) return;

    onSave({
      offering_id: offeringId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      capacity: capacity !== "" ? Number(capacity) : null,
      active,
    });
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      const endHours = (hours + 2) % 24;
      const paddedHours = String(endHours).padStart(2, "0");
      const paddedMinutes = String(minutes).padStart(2, "0");
      setEndTime(`${paddedHours}:${paddedMinutes}`);
    }
  };

  const isValid = !!offeringId && !!dayOfWeek && !!startTime && !!endTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Class" : "Add Class"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Subject Offering */}
          <div className="grid gap-1.5">
            <Label htmlFor="offering">Subject</Label>
            <Select value={offeringId} onValueChange={setOfferingId}>
              <SelectTrigger id="offering">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOfferings.map((s) => (
                  <SelectItem key={s.subject_id} value={s.subject_id}>
                    {s.subject_name} — Year {s.grade}
                    {s.location ? ` (${s.location})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day of Week */}
          <div className="grid gap-1.5">
            <Label htmlFor="day">Day of Week</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="grid gap-1.5">
            <Label htmlFor="capacity">Capacity (optional)</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              placeholder="e.g. 20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Switch id="active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isEditing ? "Save Changes" : "Add Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDialog;
