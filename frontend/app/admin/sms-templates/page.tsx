"use client";

import { LoadingBar } from "@/components/loading-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsync } from "@/hooks/use-async";
import type { SMSTemplateSummary } from "@/lib/api/types/sms";
import { smsService } from "@/lib/services";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SMSTemplatesPage = () => {
  const router = useRouter();
  const { run, isPending } = useAsync();
  const [templates, setTemplates] = useState<SMSTemplateSummary[]>([]);

  const loadTemplates = useCallback(() => {
    run(async () => {
      setTemplates(await smsService.getSMSTemplatesAsync());
    });
  }, [run]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="space-y-6">
      <LoadingBar isLoading={isPending} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SMS templates</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage reusable SMS templates.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/admin/sms-templates/new")}
        >
          <Plus className="size-4" />
          New template
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 && !isPending ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center"
                >
                  No SMS templates have been created.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="capitalize">{template.provider}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.length === 0 ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary">
                            {variable}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/sms-templates/${template.id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SMSTemplatesPage;
