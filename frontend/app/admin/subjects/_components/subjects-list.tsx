"use client";

import { SubjectOffering } from "@/types/IApiWrapper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Pencil } from "lucide-react";

type SubjectsListProps = {
  locationFilter: string;
  subjectOfferings: SubjectOffering[];
  onEdit: (subject: SubjectOffering) => void;
};

const SubjectsList = ({ subjectOfferings, onEdit }: SubjectsListProps) => {
  return (
    <div className="w-full border rounded-md bg-primary-foreground p-3">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="">Subject</TableHead>
            <TableHead className="">Grade</TableHead>
            <TableHead className="flex items-center">
              <DollarSign className="size-3.5 text-muted-foreground" />
              Price
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjectOfferings.map((subjectOffering) => (
            <TableRow key={subjectOffering.subject_id} className="group">
              <TableCell className="pl-4 font-medium text-foreground">
                {subjectOffering.subject_name}
              </TableCell>
              <TableCell>{subjectOffering.grade}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-foreground">
                  {subjectOffering.price_per_term.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(subjectOffering)}
                    aria-label={`Edit ${subjectOffering.subject_name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubjectsList;
