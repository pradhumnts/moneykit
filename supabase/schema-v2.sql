-- MoneyKit normal DB schema (PIN-gated via app API; service role on server)
-- Run in Supabase SQL Editor after the old household_sync setup.

create table if not exists households (
  id text primary key,
  name text not null,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists members (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  name text not null,
  role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists accounts (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  owner_member_id text references members(id) on delete set null,
  slug text not null,
  name text not null,
  account_type text not null,
  balance_in_paise bigint not null default 0,
  cap_in_paise bigint,
  total_added_in_paise bigint not null default 0,
  total_spent_in_paise bigint not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expense_categories (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists allocations (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  original_amount_in_paise bigint not null,
  note text not null default '',
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_status text not null default 'synced'
);

create table if not exists allocation_items (
  id text primary key,
  allocation_id text not null references allocations(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  amount_in_paise bigint not null,
  allocation_type text not null,
  percentage_basis_points int,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  member_id text references members(id) on delete set null,
  allocation_id text references allocations(id) on delete set null,
  transaction_type text not null,
  direction text not null,
  amount_in_paise bigint not null,
  balance_before_in_paise bigint not null,
  balance_after_in_paise bigint not null,
  expense_category_id text references expense_categories(id) on delete set null,
  title text not null,
  note text not null default '',
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  sync_status text not null default 'synced'
);

create table if not exists household_settings (
  household_id text primary key references households(id) on delete cascade,
  currency text not null default 'INR',
  locale text not null default 'en-IN',
  timezone text not null default 'Asia/Kolkata',
  my_daily_cap_in_paise bigint not null,
  wife_daily_cap_in_paise bigint not null,
  primary_account_id text references accounts(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_household_created
  on transactions (household_id, created_at desc);

create index if not exists idx_transactions_account
  on transactions (account_id, created_at desc);

create index if not exists idx_allocations_household
  on allocations (household_id, created_at desc);

create index if not exists idx_allocation_items_allocation
  on allocation_items (allocation_id);

-- Atomic expense: both phones can add without overwriting each other.
create or replace function apply_expense(
  p_tx jsonb,
  p_account_id text,
  p_amount bigint
) returns jsonb
language plpgsql
as $$
declare
  v_balance bigint;
  v_after bigint;
begin
  select balance_in_paise into v_balance
  from accounts
  where id = p_account_id
  for update;

  if v_balance is null then
    raise exception 'Account not found';
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  v_after := v_balance - p_amount;

  update accounts
  set
    balance_in_paise = v_after,
    total_spent_in_paise = total_spent_in_paise + p_amount,
    updated_at = now()
  where id = p_account_id;

  insert into transactions (
    id, household_id, account_id, member_id, allocation_id,
    transaction_type, direction, amount_in_paise,
    balance_before_in_paise, balance_after_in_paise,
    expense_category_id, title, note, transaction_date,
    created_at, updated_at, deleted_at, sync_status
  ) values (
    p_tx->>'id',
    p_tx->>'householdId',
    p_tx->>'accountId',
    nullif(p_tx->>'memberId', ''),
    nullif(p_tx->>'allocationId', ''),
    p_tx->>'transactionType',
    p_tx->>'direction',
    (p_tx->>'amountInPaise')::bigint,
    v_balance,
    v_after,
    nullif(p_tx->>'expenseCategoryId', ''),
    p_tx->>'title',
    coalesce(p_tx->>'note', ''),
    (p_tx->>'transactionDate')::date,
    coalesce((p_tx->>'createdAt')::timestamptz, now()),
    now(),
    null,
    'synced'
  );

  return jsonb_build_object(
    'balanceBeforeInPaise', v_balance,
    'balanceAfterInPaise', v_after
  );
end;
$$;

-- Atomic balance adjustment.
create or replace function apply_adjustment(
  p_tx jsonb,
  p_account_id text,
  p_new_balance bigint
) returns jsonb
language plpgsql
as $$
declare
  v_before bigint;
begin
  select balance_in_paise into v_before
  from accounts
  where id = p_account_id
  for update;

  if v_before is null then
    raise exception 'Account not found';
  end if;

  update accounts
  set
    balance_in_paise = p_new_balance,
    updated_at = now()
  where id = p_account_id;

  insert into transactions (
    id, household_id, account_id, member_id, allocation_id,
    transaction_type, direction, amount_in_paise,
    balance_before_in_paise, balance_after_in_paise,
    expense_category_id, title, note, transaction_date,
    created_at, updated_at, deleted_at, sync_status
  ) values (
    p_tx->>'id',
    p_tx->>'householdId',
    p_tx->>'accountId',
    nullif(p_tx->>'memberId', ''),
    null,
    p_tx->>'transactionType',
    p_tx->>'direction',
    (p_tx->>'amountInPaise')::bigint,
    v_before,
    p_new_balance,
    null,
    p_tx->>'title',
    coalesce(p_tx->>'note', ''),
    (p_tx->>'transactionDate')::date,
    coalesce((p_tx->>'createdAt')::timestamptz, now()),
    now(),
    null,
    'synced'
  );

  return jsonb_build_object(
    'balanceBeforeInPaise', v_before,
    'balanceAfterInPaise', p_new_balance
  );
end;
$$;

-- Apply a full allocation payload (allocation + items + txs + account deltas).
create or replace function apply_allocation_payload(p_payload jsonb)
returns void
language plpgsql
as $$
declare
  v_alloc jsonb := p_payload->'allocation';
  v_item jsonb;
  v_tx jsonb;
  v_account jsonb;
begin
  insert into allocations (
    id, household_id, original_amount_in_paise, note, transaction_date,
    created_at, updated_at, sync_status
  ) values (
    v_alloc->>'id',
    v_alloc->>'householdId',
    (v_alloc->>'originalAmountInPaise')::bigint,
    coalesce(v_alloc->>'note', ''),
    (v_alloc->>'transactionDate')::date,
    coalesce((v_alloc->>'createdAt')::timestamptz, now()),
    now(),
    'synced'
  );

  for v_item in select * from jsonb_array_elements(p_payload->'allocationItems')
  loop
    insert into allocation_items (
      id, allocation_id, account_id, amount_in_paise,
      allocation_type, percentage_basis_points, created_at
    ) values (
      v_item->>'id',
      v_item->>'allocationId',
      v_item->>'accountId',
      (v_item->>'amountInPaise')::bigint,
      v_item->>'allocationType',
      nullif(v_item->>'percentageBasisPoints', '')::int,
      coalesce((v_item->>'createdAt')::timestamptz, now())
    );
  end loop;

  for v_tx in select * from jsonb_array_elements(p_payload->'transactions')
  loop
    insert into transactions (
      id, household_id, account_id, member_id, allocation_id,
      transaction_type, direction, amount_in_paise,
      balance_before_in_paise, balance_after_in_paise,
      expense_category_id, title, note, transaction_date,
      created_at, updated_at, deleted_at, sync_status
    ) values (
      v_tx->>'id',
      v_tx->>'householdId',
      v_tx->>'accountId',
      nullif(v_tx->>'memberId', ''),
      nullif(v_tx->>'allocationId', ''),
      v_tx->>'transactionType',
      v_tx->>'direction',
      (v_tx->>'amountInPaise')::bigint,
      (v_tx->>'balanceBeforeInPaise')::bigint,
      (v_tx->>'balanceAfterInPaise')::bigint,
      nullif(v_tx->>'expenseCategoryId', ''),
      v_tx->>'title',
      coalesce(v_tx->>'note', ''),
      (v_tx->>'transactionDate')::date,
      coalesce((v_tx->>'createdAt')::timestamptz, now()),
      now(),
      null,
      'synced'
    );
  end loop;

  for v_account in select * from jsonb_array_elements(p_payload->'accounts')
  loop
    update accounts
    set
      balance_in_paise = (v_account->>'balanceInPaise')::bigint,
      total_added_in_paise = coalesce((v_account->>'totalAddedInPaise')::bigint, total_added_in_paise),
      total_spent_in_paise = coalesce((v_account->>'totalSpentInPaise')::bigint, total_spent_in_paise),
      updated_at = now()
    where id = v_account->>'id';
  end loop;
end;
$$;
