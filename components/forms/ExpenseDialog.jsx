"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { ACCOUNT_IDS } from "@/constants/allocationRules";

export function ExpenseDialog({
  open,
  onOpenChange,
  initialAccountId = ACCOUNT_IDS.myDaily,
}) {
  const [step, setStep] = useState("form");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setStep("form");
        onOpenChange?.(nextOpen);
      }}
    >
      <DialogContent
        className="flex max-h-[min(92vh,720px)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">
          {step === "confirm"
            ? "Confirm expense"
            : step === "success"
              ? "Expense recorded"
              : "Record an expense"}
        </DialogTitle>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {open ? (
            <ExpenseForm
              key={`${initialAccountId}-${open}`}
              initialAccountId={initialAccountId}
              onCancel={() => onOpenChange?.(false)}
              onStepChange={setStep}
              compact
              embedded
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
