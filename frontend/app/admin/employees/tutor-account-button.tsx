"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EmployeeInfo } from "@/lib/api/types";

type Credentials = { email: string; temporaryPassword: string };

export function TutorAccountButton({
  tutor,
  onChanged,
}: {
  tutor: EmployeeInfo;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const reset = !!tutor.auth_user_id;

  function close() {
    setCredentials(null);
    setError(null);
    setCopied(false);
    setOpen(false);
    // Refresh only after dismissing the credentials, otherwise the row unmounts
    // and the admin loses the only displayed copy of the password.
    if (attempted) onChanged();
    setAttempted(false);
  }

  async function manageAccount() {
    setBusy(true);
    setError(null);
    setAttempted(true);
    try {
      const response = await fetch(
        `/api/admin/tutors/${tutor.tutor_id}/account`,
        {
          method: reset ? "PATCH" : "POST",
          cache: "no-store",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Could not update this account.");
      setCredentials({
        email: result.email,
        temporaryPassword: result.temporaryPassword,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update this account. Close and refresh before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `Email: ${credentials.email}\nTemporary password: ${credentials.temporaryPassword}`,
      );
      setCopied(true);
    } catch {
      setError(
        "Copy is unavailable. Select and copy the login details below manually.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) setOpen(true);
        else if (!busy && !credentials) close();
      }}
    >
      <Button
        size="sm"
        variant="outline"
        disabled={!tutor.email?.trim()}
        onClick={() => setOpen(true)}
      >
        {reset ? "Reset password" : "Create account"}
      </Button>
      <DialogContent
        showCloseButton={!busy && !credentials}
        onInteractOutside={(event) => {
          if (busy || credentials) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (busy || credentials) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {credentials
              ? "Employee login details"
              : reset
                ? "Reset employee password"
                : "Create employee account"}
          </DialogTitle>
          <DialogDescription>
            {credentials
              ? "Copy these details and share them with the employee. The temporary password won’t be shown again after closing."
              : `${reset ? "Replace the current password for" : "Create a login for"} ${tutor.first_name} ${tutor.last_name} (${tutor.email}). No email will be sent.`}
          </DialogDescription>
        </DialogHeader>
        {credentials && (
          <div className="space-y-3">
            <p className="text-sm break-all">
              <span className="font-medium">Email: </span>
              {credentials.email}
            </p>
            <div>
              <p className="text-sm font-medium mb-1">Temporary password</p>
              <code className="block rounded bg-muted p-3 break-all select-all">
                {credentials.temporaryPassword}
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              After signing in, the employee can go to My profile → Change
              password.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          {credentials ? (
            <>
              <Button variant="outline" onClick={copy}>
                {copied ? "Copied" : "Copy login details"}
              </Button>
              <Button onClick={close}>I’ve saved the details</Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={busy} onClick={close}>
                Cancel
              </Button>
              <Button disabled={busy} onClick={manageAccount}>
                {busy
                  ? "Please wait..."
                  : reset
                    ? "Generate new password"
                    : "Create account"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
