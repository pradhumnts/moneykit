"use client";

import { useState } from "react";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { BottomActionBar, ActionButton } from "@/components/forms/BottomActionBar";
import { DatePicker } from "@/components/forms/DatePicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationPanel } from "@/components/forms/ConfirmationPanel";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { rupeesToPaise, paiseToRupees } from "@/lib/domain/money";
import { parseINRInputToRupees, formatPaiseAsINR } from "@/lib/utils/currency";
import { getTodayDateString } from "@/lib/utils/dates";
import { useMoney } from "@/hooks/useMoney";

export function BalanceAdjustmentForm({
  account,
  onDone,
  onCancel,
  embedded = false,
}) {
  const { previewAdjustment, adjustBalance, isSaving } = useMoney();
  const [balanceRaw, setBalanceRaw] = useState(
    String(paiseToRupees(account.balanceInPaise))
  );
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [step, setStep] = useState("form");

  const parsed = parseINRInputToRupees(balanceRaw);
  const newBalanceInPaise = parsed === null ? null : rupeesToPaise(parsed);
  const preview =
    newBalanceInPaise === null
      ? { ok: false, validation: { errors: { newBalance: "Enter a valid balance." } } }
      : previewAdjustment({
          account,
          newBalanceInPaise,
          note,
        });

  async function handleConfirm() {
    if (!preview.ok) return;
    await adjustBalance({
      accountId: account.id,
      newBalanceInPaise: preview.newBalanceInPaise,
      note: note.trim(),
      transactionDate: date,
    });
    onDone?.();
  }

  if (step === "confirm" && preview.ok) {
    return (
      <ConfirmationPanel
        title="Confirm adjustment"
        onBack={() => setStep("form")}
        onConfirm={handleConfirm}
        confirmLabel="Save adjustment"
        isLoading={isSaving}
        embedded={embedded}
        rows={[
          { label: "Account", value: account.name },
          {
            label: "Previous balance",
            value: formatPaiseAsINR(preview.previousBalanceInPaise),
          },
          {
            label: "New balance",
            value: formatPaiseAsINR(preview.newBalanceInPaise),
          },
          {
            label: "Difference",
            value: formatPaiseAsINR(preview.differenceInPaise, {
              showPlus: preview.differenceInPaise > 0,
              signed: true,
            }),
          },
          { label: "Reason", value: note.trim() },
          { label: "Date", value: date },
        ]}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted/70 p-4">
        <p className="text-xs text-muted-foreground">Current balance</p>
        <CurrencyDisplay amountInPaise={account.balanceInPaise} size="lg" />
      </div>

      <AmountInput
        id="new-balance"
        label="New actual balance"
        value={balanceRaw}
        onValueChange={setBalanceRaw}
        error={preview.validation?.errors?.newBalance}
      />

      <FormField
        label="Reason"
        htmlFor="adjust-note"
        error={preview.validation?.errors?.note}
      >
        <Textarea
          id="adjust-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Bank correction"
          className="min-h-24 rounded-2xl"
        />
      </FormField>

      <FormField label="Date" htmlFor="adjust-date">
        <DatePicker
          id="adjust-date"
          value={date}
          onChange={setDate}
        />
      </FormField>

      <BottomActionBar embedded={embedded}>
        <Button
          type="button"
          variant="outline"
          className="min-h-12 flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          type="button"
          disabled={!preview.ok || isSaving}
          onClick={() => setStep("confirm")}
        >
          Review adjustment
        </ActionButton>
      </BottomActionBar>
    </div>
  );
}
