"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SubjectsList = () => {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="">Subject</TableHead>
            <TableHead className="">Grade</TableHead>
            <TableHead className="">Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* {items.map((item) => (
            <TableRow key={item.id} className="group">
              <TableCell className="pl-4 font-medium text-foreground">
                {item.subject}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-normal">
                  Year {item.grade}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-foreground">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                  {item.price.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(item)}
                    aria-label={`Edit ${item.subject}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete ${item.subject}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))} */}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubjectsList;
