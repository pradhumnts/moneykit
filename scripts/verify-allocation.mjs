/**
 * Run with: npm run verify:allocation
 */

function roundPaise(paise) {
  return Math.round(Number(paise) || 0);
}

function applyPercentageInPaise(amountInPaise, basisPoints) {
  return Math.round((roundPaise(amountInPaise) * basisPoints) / 10000);
}

function amountNeededToCap(balanceInPaise, capInPaise) {
  return Math.max(0, roundPaise(capInPaise) - roundPaise(balanceInPaise));
}

function dividePaise(amountInPaise, parts = 2) {
  const amount = roundPaise(amountInPaise);
  const base = Math.floor(amount / parts);
  const remainder = amount - base * parts;
  const shares = Array.from({ length: parts }, () => base);
  shares[0] += remainder;
  return shares;
}

function calculateAllocation({
  amountInPaise,
  myDailyBalanceInPaise = 0,
  wifeDailyBalanceInPaise = 0,
  myDailyCapInPaise = 4_000_000,
  wifeDailyCapInPaise = 1_000_000,
}) {
  const originalAmount = roundPaise(amountInPaise);

  const desired = {
    myDaily: amountNeededToCap(myDailyBalanceInPaise, myDailyCapInPaise),
    wifeDaily: amountNeededToCap(wifeDailyBalanceInPaise, wifeDailyCapInPaise),
    family: applyPercentageInPaise(originalAmount, 2000),
  };

  let available = originalAmount;
  const take = (desiredAmount) => {
    const amount = Math.min(desiredAmount, available);
    available -= amount;
    return amount;
  };

  const myDaily = take(desired.myDaily);
  const wifeDaily = take(desired.wifeDaily);
  const family = take(desired.family);
  const [bigSavings, futureExpenses] = dividePaise(available, 2);

  const total = myDaily + wifeDaily + family + bigSavings + futureExpenses;

  return {
    myDaily,
    wifeDaily,
    family,
    bigSavings,
    futureExpenses,
    total,
    originalAmount,
  };
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const s1 = calculateAllocation({
  amountInPaise: 23_142_500,
  myDailyBalanceInPaise: 3_100_000,
  wifeDailyBalanceInPaise: 800_000,
});
assertEqual("S1 myDaily", s1.myDaily, 900_000);
assertEqual("S1 wifeDaily", s1.wifeDaily, 200_000);
assertEqual("S1 family", s1.family, 4_628_500);
assertEqual("S1 bigSavings", s1.bigSavings, 8_707_000);
assertEqual("S1 future", s1.futureExpenses, 8_707_000);
assertEqual("S1 total", s1.total, 23_142_500);

const s2 = calculateAllocation({
  amountInPaise: 10_000_000,
  myDailyBalanceInPaise: 4_000_000,
  wifeDailyBalanceInPaise: 1_000_000,
});
assertEqual("S2 myDaily", s2.myDaily, 0);
assertEqual("S2 wifeDaily", s2.wifeDaily, 0);
assertEqual("S2 family", s2.family, 2_000_000);
assertEqual("S2 bigSavings", s2.bigSavings, 4_000_000);
assertEqual("S2 future", s2.futureExpenses, 4_000_000);

const s3 = calculateAllocation({
  amountInPaise: 5_000_000,
  myDailyBalanceInPaise: 3_500_000,
  wifeDailyBalanceInPaise: 900_000,
});
assertEqual("S3 myDaily", s3.myDaily, 500_000);
assertEqual("S3 wifeDaily", s3.wifeDaily, 100_000);
assertEqual("S3 family", s3.family, 1_000_000);
assertEqual("S3 bigSavings", s3.bigSavings, 1_700_000);
assertEqual("S3 future", s3.futureExpenses, 1_700_000);
assertEqual("S3 total", s3.total, 5_000_000);

console.log("All allocation scenarios passed.");
