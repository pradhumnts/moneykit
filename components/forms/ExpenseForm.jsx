"use client";

import { useEffect, useMemo, useState } from "react";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { BottomActionBar, ActionButton } from "@/components/forms/BottomActionBar";
import { DatePicker } from "@/components/forms/DatePicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationPanel } from "@/components/forms/ConfirmationPanel";
import { SuccessState } from "@/components/feedback/SuccessState";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { ACCOUNT_IDS } from "@/constants/allocationRules";
import {
  OTHER_EXPENSE_ACCOUNT_IDS,
  PRIMARY_EXPENSE_ACCOUNT_IDS,
} from "@/constants/accounts";
import { rupeesToPaise } from "@/lib/domain/money";
import { parseINRInputToRupees, formatPaiseAsINR } from "@/lib/utils/currency";
import { getTodayDateString } from "@/lib/utils/dates";
import { useMoney } from "@/hooks/useMoney";

export function ExpenseForm({
  initialAccountId = ACCOUNT_IDS.myDaily,
  onCancel,
  compact = false,
  embedded = false,
  onStepChange,
}) {
  const {
    accounts,
    expenseCategories,
    previewExpense,
    addExpense,
    isSaving,
    getAccountById,
  } = useMoney();

  const [amountRaw, setAmountRaw] = useState("");
  const [paidFromGroup, setPaidFromGroup] = useState(
    PRIMARY_EXPENSE_ACCOUNT_IDS.includes(initialAccountId) ? "primary" : "other"
  );
  const [accountId, setAccountId] = useState(initialAccountId);
  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [step, setStep] = useState("form");
  const [lastResult, setLastResult] = useState(null);

  const resolvedCategoryId =
    expenseCategoryId || expenseCategories[0]?.id || "";

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const accountsById = useMemo(() => {
    const map = {};
    for (const account of accounts) map[account.id] = account;
    return map;
  }, [accounts]);

  const paidFromItems = useMemo(() => {
    const items = {};
    for (const id of PRIMARY_EXPENSE_ACCOUNT_IDS) {
      items[id] = accountsById[id]?.name || id;
    }
    items["other-group"] = "Other account…";
    if (paidFromGroup === "other") {
      for (const id of OTHER_EXPENSE_ACCOUNT_IDS) {
        items[id] = accountsById[id]?.name || id;
      }
    }
    return items;
  }, [accountsById, paidFromGroup]);

  const otherAccountItems = useMemo(() => {
    const items = {};
    for (const id of OTHER_EXPENSE_ACCOUNT_IDS) {
      items[id] = accountsById[id]?.name || id;
    }
    return items;
  }, [accountsById]);

  const categoryItems = useMemo(() => {
    const items = {};
    for (const category of expenseCategories) {
      items[category.id] = category.name;
    }
    return items;
  }, [expenseCategories]);

  const selectedAccount = getAccountById(accountId);
  const amountRupees = parseINRInputToRupees(amountRaw);
  const amountInPaise =
    amountRupees === null ? 0 : rupeesToPaise(amountRupees);

  const preview = previewExpense({
    amountInPaise,
    account: selectedAccount,
    expenseCategoryId: resolvedCategoryId,
    transactionDate: date,
  });

  const amountError =
    amountRaw && preview.validation?.errors?.amount === "insufficient"
      ? `${formatPaiseAsINR(preview.validation.errors.availableInPaise)} available`
      : amountRaw && preview.validation?.errors?.amount
        ? preview.validation.errors.amount
        : null;

  const canContinue = preview.ok && !isSaving;

  async function handleConfirm() {
    if (!canContinue) return;
    const category = expenseCategories.find((c) => c.id === resolvedCategoryId);
    const state = await addExpense({
      amountInPaise,
      accountId,
      expenseCategoryId: resolvedCategoryId,
      note: description.trim(),
      title: description.trim() || category?.name || "Expense",
      transactionDate: date,
    });
    const updated = state.accounts.find((a) => a.id === accountId);
    setLastResult({
      amountInPaise,
      accountName: selectedAccount?.name,
      categoryName: category?.name,
      balanceAfterInPaise: updated?.balanceInPaise ?? preview.balanceAfterInPaise,
    });
    setStep("success");
  }

  if (step === "success" && lastResult) {
    return (
      <SuccessState
        title="Expense recorded"
        description={`${formatPaiseAsINR(lastResult.amountInPaise)} · ${lastResult.accountName}`}
        primaryLabel="Back to expenses"
        primaryHref="/expenses"
        secondaryLabel="View activity"
        secondaryHref="/activity"
      >
        <div className="rounded-2xl bg-muted/70 p-4 text-sm">
          <p className="text-muted-foreground">Updated balance</p>
          <CurrencyDisplay amountInPaise={lastResult.balanceAfterInPaise} size="lg" />
        </div>
      </SuccessState>
    );
  }

  if (step === "confirm") {
    const category = expenseCategories.find((c) => c.id === resolvedCategoryId);
    return (
      <ConfirmationPanel
        title="Confirm expense"
        onBack={() => setStep("form")}
        onConfirm={handleConfirm}
        confirmLabel="Save expense"
        isLoading={isSaving}
        embedded={embedded}
        rows={[
          { label: "Amount", value: formatPaiseAsINR(amountInPaise) },
          { label: "Paid from", value: selectedAccount?.name },
          { label: "Category", value: category?.name },
          { label: "Description", value: description.trim() || "—" },
          {
            label: "Balance before",
            value: formatPaiseAsINR(preview.balanceBeforeInPaise),
          },
          {
            label: "Balance after",
            value: formatPaiseAsINR(preview.balanceAfterInPaise),
          },
        ]}
      />
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {embedded ? (
        <div>
          <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground">
            Record expense
          </h2>
        </div>
      ) : null}

      <AmountInput
        value={amountRaw}
        onValueChange={setAmountRaw}
        error={amountError}
        large={!compact}
      />

      <FormField label="Paid from" htmlFor="paid-from">
        <Select
          value={accountId}
          items={paidFromItems}
          onValueChange={(value) => {
            if (value === "other-group") {
              setPaidFromGroup("other");
              setAccountId(OTHER_EXPENSE_ACCOUNT_IDS[0]);
              return;
            }
            if (PRIMARY_EXPENSE_ACCOUNT_IDS.includes(value)) {
              setPaidFromGroup("primary");
              setAccountId(value);
              return;
            }
            setPaidFromGroup("other");
            setAccountId(value);
          }}
        >
          <SelectTrigger id="paid-from" className="min-h-11 w-full rounded-2xl">
            <SelectValue placeholder="Choose account" />
          </SelectTrigger>
          <SelectContent>
            {PRIMARY_EXPENSE_ACCOUNT_IDS.map((id) => (
              <SelectItem key={id} value={id}>
                {accountsById[id]?.name || id}
              </SelectItem>
            ))}
            <SelectItem value="other-group">Other account…</SelectItem>
            {paidFromGroup === "other"
              ? OTHER_EXPENSE_ACCOUNT_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {accountsById[id]?.name || id}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
        {selectedAccount ? (
          <p className="text-xs text-muted-foreground">
            Available{" "}
            <CurrencyDisplay
              amountInPaise={selectedAccount.balanceInPaise}
              size="sm"
              className="inline text-xs font-medium text-foreground"
            />
          </p>
        ) : null}
      </FormField>

      {paidFromGroup === "other" ? (
        <FormField label="Other account" htmlFor="other-account">
          <Select
            value={accountId}
            items={otherAccountItems}
            onValueChange={setAccountId}
          >
            <SelectTrigger id="other-account" className="min-h-11 w-full rounded-2xl">
              <SelectValue placeholder="Choose account" />
            </SelectTrigger>
            <SelectContent>
              {OTHER_EXPENSE_ACCOUNT_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {accountsById[id]?.name || id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      ) : null}

      <FormField label="Expense category" htmlFor="expense-category">
        <Select
          value={resolvedCategoryId || null}
          items={categoryItems}
          onValueChange={setExpenseCategoryId}
        >
          <SelectTrigger id="expense-category" className="min-h-11 w-full rounded-2xl">
            <SelectValue placeholder="Choose category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Groceries…"
          className="min-h-20 rounded-2xl"
        />
      </FormField>

      <FormField label="Date" htmlFor="expense-date">
        <DatePicker
          id="expense-date"
          value={date}
          onChange={setDate}
        />
      </FormField>

      <BottomActionBar embedded={embedded}>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-12 flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <ActionButton
          type="button"
          disabled={!canContinue}
          onClick={() => setStep("confirm")}
        >
          Review expense
        </ActionButton>
      </BottomActionBar>
    </div>
  );
}
