"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StepIndicator } from "@/components/feedback/StepIndicator";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { BottomActionBar, ActionButton } from "@/components/forms/BottomActionBar";
import { DatePicker } from "@/components/forms/DatePicker";
import { AllocationPreview } from "@/components/money/AllocationPreview";
import { SuccessState } from "@/components/feedback/SuccessState";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMoney } from "@/hooks/useMoney";
import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { rupeesToPaise, paiseToRupees } from "@/lib/domain/money";
import { parseINRInputToRupees, formatPaiseAsINR } from "@/lib/utils/currency";
import { getTodayDateString } from "@/lib/utils/dates";
import { amountNeededToCap } from "@/lib/domain/money";

const STEPS = ["Amount", "Daily balances", "Review", "Done"];

export default function AddMoneyPage() {
  const router = useRouter();
  const {
    isLoading,
    accounts,
    getAccountById,
    previewAllocation,
    addAllocation,
    isSaving,
    totalBalanceInPaise,
  } = useMoney();

  const myDaily = getAccountById(ACCOUNT_IDS.myDaily);
  const wifeDaily = getAccountById(ACCOUNT_IDS.wifeDaily);

  const [step, setStep] = useState(0);
  const [amountRaw, setAmountRaw] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [myDailyRaw, setMyDailyRaw] = useState(null);
  const [wifeDailyRaw, setWifeDailyRaw] = useState(null);
  const [amountError, setAmountError] = useState("");
  const [preview, setPreview] = useState(null);
  const [distributedAmount, setDistributedAmount] = useState(0);

  const accountsById = useMemo(() => {
    const map = {};
    for (const account of accounts) map[account.id] = account;
    return map;
  }, [accounts]);

  const myDailyBalanceInPaise =
    myDailyRaw === null
      ? myDaily?.balanceInPaise ?? 0
      : rupeesToPaise(parseINRInputToRupees(myDailyRaw) ?? 0);
  const wifeDailyBalanceInPaise =
    wifeDailyRaw === null
      ? wifeDaily?.balanceInPaise ?? 0
      : rupeesToPaise(parseINRInputToRupees(wifeDailyRaw) ?? 0);

  function ensureDailyDefaults() {
    if (myDailyRaw === null && myDaily) {
      setMyDailyRaw(String(paiseToRupees(myDaily.balanceInPaise)));
    }
    if (wifeDailyRaw === null && wifeDaily) {
      setWifeDailyRaw(String(paiseToRupees(wifeDaily.balanceInPaise)));
    }
  }

  function handleContinueFromAmount() {
    const parsed = parseINRInputToRupees(amountRaw);
    if (parsed === null || parsed <= 0) {
      setAmountError("Enter an amount.");
      return;
    }
    setAmountError("");
    ensureDailyDefaults();
    setStep(1);
  }

  function handleContinueFromDaily() {
    const parsed = parseINRInputToRupees(amountRaw);
    const amountInPaise = rupeesToPaise(parsed);
    const result = previewAllocation({
      amountInPaise,
      myDailyBalanceInPaise,
      wifeDailyBalanceInPaise,
    });
    if (!result.ok) {
      setAmountError(result.error);
      setStep(0);
      return;
    }
    setPreview(result.preview);
    setStep(2);
  }

  function handleBack() {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((current) => Math.max(0, current - 1));
  }

  async function handleConfirm() {
    if (!preview || isSaving) return;
    if (preview.remainingDifference !== 0) return;

    await addAllocation({
      amountInPaise: preview.originalAmount,
      note: note.trim(),
      transactionDate: date,
      myDailyBalanceInPaise,
      wifeDailyBalanceInPaise,
    });
    setDistributedAmount(preview.originalAmount);
    setStep(3);
  }

  if (isLoading) {
    return (
      <AppShell hideNav>
        <LoadingState />
      </AppShell>
    );
  }

  if (step === 3) {
    return (
      <AppShell hideNav>
        <SuccessState
          title="Money distributed"
          description={`${formatPaiseAsINR(distributedAmount)} split.`}
          primaryLabel="Back home"
          primaryHref="/"
          secondaryLabel="View activity"
          secondaryHref="/activity"
        >
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Updated total balance</p>
            <CurrencyDisplay amountInPaise={totalBalanceInPaise} size="lg" />
          </div>
        </SuccessState>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {step === 0 ? "Home" : "Back"}
      </button>

      <PageHeader title="Add money" />
      <StepIndicator steps={STEPS.slice(0, 3)} currentStep={step} />

      {step === 0 ? (
        <div className="space-y-5">
          <AmountInput
            value={amountRaw}
            onValueChange={(value) => {
              setAmountRaw(value);
              setAmountError("");
            }}
            error={amountError}
            large
            autoFocus
          />
          <FormField label="Note" htmlFor="note">
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Salary, gift, transfer…"
              className="min-h-24"
            />
          </FormField>
          <FormField label="Date" htmlFor="income-date">
            <DatePicker
              id="income-date"
              value={date}
              onChange={setDate}
            />
          </FormField>
          <BottomActionBar plain>
            <ActionButton type="button" onClick={handleContinueFromAmount}>
              Continue
            </ActionButton>
          </BottomActionBar>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Edit if balances changed outside the app.
          </p>

          <DailyBalanceEditor
            label="My Daily Expense"
            capInPaise={myDaily?.capInPaise}
            value={myDailyRaw ?? ""}
            onChange={setMyDailyRaw}
          />
          <DailyBalanceEditor
            label="Wife's Daily Expense"
            capInPaise={wifeDaily?.capInPaise}
            value={wifeDailyRaw ?? ""}
            onChange={setWifeDailyRaw}
          />

          <BottomActionBar plain>
            <ActionButton type="button" onClick={handleContinueFromDaily}>
              Review your split
            </ActionButton>
          </BottomActionBar>
        </div>
      ) : null}

      {step === 2 && preview ? (
        <div className="space-y-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <Card className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft">
            <CardContent className="space-y-2 p-5 sm:p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Received
              </p>
              <CurrencyDisplay
                amountInPaise={preview.originalAmount}
                size="xl"
                className="font-extrabold tracking-tight text-foreground"
              />
              {note ? (
                <p className="pt-1 text-sm text-muted-foreground">{note}</p>
              ) : null}
            </CardContent>
          </Card>

          <AllocationPreview
            preview={preview}
            accountsById={accountsById}
            editedDailyBalances={{
              myDaily: myDailyBalanceInPaise,
              wifeDaily: wifeDailyBalanceInPaise,
            }}
          />

          <BottomActionBar sticky>
            <ActionButton
              type="button"
              onClick={handleConfirm}
              disabled={isSaving || preview.remainingDifference !== 0}
            >
              {isSaving ? "Saving…" : "Confirm allocation"}
            </ActionButton>
          </BottomActionBar>
        </div>
      ) : null}
    </AppShell>
  );
}

function DailyBalanceEditor({ label, capInPaise, value, onChange }) {
  const balanceInPaise = rupeesToPaise(parseINRInputToRupees(value) ?? 0);
  const needed = amountNeededToCap(balanceInPaise, capInPaise);
  const aboveCap = balanceInPaise > (capInPaise || 0);

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground">
              Cap {formatPaiseAsINR(capInPaise)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {aboveCap
              ? "Above cap"
              : needed === 0
                ? "Cap reached"
                : `${formatPaiseAsINR(needed)} needed`}
          </p>
        </div>
        <AmountInput
          id={`daily-${label}`}
          label="Current balance"
          value={value}
          onValueChange={onChange}
        />
        {aboveCap ? (
          <p className="text-xs text-muted-foreground">No top-up.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
