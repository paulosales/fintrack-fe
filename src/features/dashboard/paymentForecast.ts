import type { Account } from '../../models/accounts';
import type { Transaction } from '../transactions/types';

export type CadenceType = 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Bi-monthly' | 'Quarterly' | 'Custom';

export type PaymentFlowType = 'expense' | 'income';

export interface PredictedPayment {
  id: string;
  streamKey: string; // unique identifier for the recurring stream: `${accountId}:::${normalizedDesc}`
  isTracked: boolean; // whether this payment stream is marked as important / tracked
  accountId: number;
  accountName: string;
  accountCode?: string;
  description: string;
  amount: number; // positive value representing the forecasted payment amount
  rawAmount: number; // original signed amount
  flowType: PaymentFlowType;
  nextDate: string; // YYYY-MM-DD
  daysUntilDue: number; // 0 = today, 1 = tomorrow, etc.
  cadence: CadenceType;
  confidence: 'High' | 'Medium' | 'Low';
  occurrences: number;
  lastPaymentDate: string; // YYYY-MM-DD
  averageAmount: number;
}

export interface ForecastSummary {
  totalUpcomingPayments: number;
  upcomingPaymentCount: number;
  totalTrackedPayments: number;
  trackedPaymentCount: number;
  totalUpcomingIncome: number;
  upcomingIncomeCount: number;
  netForecast: number;
  nextDuePayment: PredictedPayment | null;
  nextDueTrackedPayment: PredictedPayment | null;
  averagePaymentAmount: number;
}

export interface ForecastOptions {
  windowDays?: number; // default: 30
  referenceDate?: Date; // default: new Date()
  minOccurrences?: number; // default: 2
  trackedStreamKeys?: Set<string>; // set of streamKeys explicitly marked as tracked
}

/**
 * Checks whether a recurring description belongs to common essential bills
 * (insurance, rent, mortgage, loan, credit card payments) by default.
 */
export const isDefaultImportantDescription = (description: string): boolean => {
  if (!description) return false;
  const upper = description.toUpperCase();
  return (
    upper.includes('INSURANCE') ||
    upper.includes('AUTOPAC') ||
    upper.includes('RENT') ||
    upper.includes('LEASE') ||
    upper.includes('MORTGAGE') ||
    upper.includes('AUTO PAYMENT') ||
    upper.includes('ONLINE BANKING PAYMENT') ||
    upper.includes('PAYMENT -') ||
    upper.includes('PAYMENT RBC') ||
    upper.includes('PAGAMENTO DE BOLETO') ||
    upper.includes('PAGAMENTO RECEBIDO') ||
    upper.includes('FATURA') ||
    upper.includes('LOAN') ||
    upper.includes('AFFIRM') ||
    upper.includes('CAR')
  );
};

/**
 * Normalizes a transaction description by stripping noise, trailing NaN tokens,
 * phone numbers, store numbers, mask asterisks, and excessive whitespace.
 */
export const normalizeDescription = (description: string): string => {
  if (!description) return '';
  let s = description.toUpperCase();
  // Strip trailing nan / NAN
  s = s.replace(/\s+NAN\b/gi, '');
  // Strip phone numbers e.g. 888-481-3436, 403-648-5848
  s = s.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '');
  // Strip masked identifiers like ******3170
  s = s.replace(/\*{3,}\d+/g, '');
  // Strip store hashes like #4425, #503
  s = s.replace(/#\s*\d+/g, '');
  // Strip special symbols
  s = s.replace(/[*#]/g, ' ');
  // Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

/**
 * Determines whether a recurring stream should be classified as an expense (payment) or income (deposit).
 */
export const classifyFlowType = (description: string, rawAmount: number): PaymentFlowType => {
  const upper = description.toUpperCase();

  const incomeKeywords = ['PAYROLL', 'SALARY', 'DEPOSIT', 'INTEREST', 'REFUND', 'ESTORNO', 'BONUS'];
  for (const keyword of incomeKeywords) {
    if (upper.includes(keyword)) {
      return 'income';
    }
  }

  const expenseKeywords = [
    'FEE',
    'SERVICE CHARGE',
    'CHARGE',
    'BILL',
    'SUBSCRIPTION',
    'INSURANCE',
    'PRIME',
    'NETFLIX',
    'MOBILE',
    'CONTROLE',
    'AUTOPAC',
    'AUTO PAYMENT',
    'RENT',
    'LEASE',
    'LOAN',
    'CABLE',
    'GITHUB',
    'FIT4LESS',
    'MEMBERSHIP',
    'INTERAC PURCHASE',
    'ONLINE BANKING PAYMENT',
    'PURCHASE',
    'BOLETO',
  ];
  for (const keyword of expenseKeywords) {
    if (upper.includes(keyword)) {
      return 'expense';
    }
  }

  // Fallback to sign of raw amount
  return rawAmount < 0 ? 'expense' : 'income';
};

interface TransactionGroup {
  accountId: number;
  accountName: string;
  accountCode?: string;
  normalizedDesc: string;
  latestDescription: string;
  transactions: Array<{
    amount: number;
    date: Date;
    description: string;
  }>;
}

/**
 * Main prediction function: analyzes recurring transaction data and predicts
 * upcoming payments within the requested window (default: next 30 days).
 */
export const predictUpcomingPayments = (
  transactions: Transaction[],
  accounts: Account[],
  options?: ForecastOptions
): PredictedPayment[] => {
  const windowDays = options?.windowDays ?? 30;
  const rawReferenceDate = options?.referenceDate ?? new Date();
  // Normalize reference date to start of day
  const referenceDate = new Date(
    rawReferenceDate.getFullYear(),
    rawReferenceDate.getMonth(),
    rawReferenceDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endWindowDate = new Date(referenceDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
  endWindowDate.setHours(23, 59, 59, 999);

  const minOccurrences = options?.minOccurrences ?? 2;

  // Build account lookup map
  const accountMap = new Map<number, Account>();
  for (const account of accounts) {
    accountMap.set(account.id, account);
  }

  // Group transactions by (accountId, normalizedDescription)
  const groups = new Map<string, TransactionGroup>();

  for (const tx of transactions) {
    if (tx.amount === 0) continue;

    const parsedDate = new Date(tx.datetime.replace(' ', 'T'));
    if (isNaN(parsedDate.getTime())) continue;

    const normalizedDesc = normalizeDescription(tx.description);
    if (!normalizedDesc) continue;

    const key = `${tx.accountId}:::${normalizedDesc}`;
    const account = accountMap.get(tx.accountId);
    const accountName = account ? account.name : `Account #${tx.accountId}`;
    const accountCode = account?.code;

    let group = groups.get(key);
    if (!group) {
      group = {
        accountId: tx.accountId,
        accountName,
        accountCode,
        normalizedDesc,
        latestDescription: tx.description.replace(/\s+nan$/i, '').trim(),
        transactions: [],
      };
      groups.set(key, group);
    }

    group.transactions.push({
      amount: tx.amount,
      date: parsedDate,
      description: tx.description.replace(/\s+nan$/i, '').trim(),
    });
  }

  const predictions: PredictedPayment[] = [];

  for (const [, group] of groups.entries()) {
    // Sort transactions chronologically ascending
    group.transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (group.transactions.length < minOccurrences) {
      continue;
    }

    // Update latest description from the newest transaction
    const latestTx = group.transactions[group.transactions.length - 1];
    group.latestDescription = latestTx.description;

    // Calculate intervals between consecutive transactions in fractional days
    const intervals: number[] = [];
    for (let i = 1; i < group.transactions.length; i += 1) {
      const diffMs = group.transactions[i].date.getTime() - group.transactions[i - 1].date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays >= 3) {
        // Disregard same-day / immediate duplicate entries
        intervals.push(diffDays);
      }
    }

    if (intervals.length === 0) {
      continue;
    }

    const avgInterval = intervals.reduce((acc, val) => acc + val, 0) / intervals.length;

    // Liveness check: If the last occurrence was too long ago compared to cadence, skip
    const daysSinceLast =
      (referenceDate.getTime() - latestTx.date.getTime()) / (1000 * 60 * 60 * 24);
    const maxPermittedLapse = Math.max(75, avgInterval * 2.5);
    if (daysSinceLast > maxPermittedLapse) {
      continue;
    }

    // Determine Cadence
    let cadence: CadenceType | null = null;
    let stepDays = 0;
    let isMonthly = false;

    if (avgInterval >= 5 && avgInterval <= 9) {
      cadence = 'Weekly';
      stepDays = 7;
    } else if (avgInterval >= 12 && avgInterval <= 17) {
      cadence = 'Bi-weekly';
      stepDays = 14;
    } else if (avgInterval >= 25 && avgInterval <= 35) {
      cadence = 'Monthly';
      isMonthly = true;
    } else if (avgInterval >= 55 && avgInterval <= 65) {
      cadence = 'Bi-monthly';
      stepDays = 60;
    } else if (avgInterval >= 85 && avgInterval <= 95) {
      cadence = 'Quarterly';
      stepDays = 90;
    } else if (intervals.length >= 2) {
      // Check standard deviation for custom regular intervals
      const variance =
        intervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev <= 4 && avgInterval <= 45) {
        stepDays = Math.round(avgInterval);
        cadence = 'Custom';
      }
    }

    if (!cadence) {
      continue;
    }

    // Determine Confidence level
    const variance =
      intervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    if (group.transactions.length >= 4 && stdDev <= 3) {
      confidence = 'High';
    } else if (group.transactions.length >= 3 && stdDev <= 6) {
      confidence = 'Medium';
    }

    const streamKey = `${group.accountId}:::${group.normalizedDesc}`;
    const isTracked = options?.trackedStreamKeys
      ? options.trackedStreamKeys.has(streamKey)
      : isDefaultImportantDescription(group.latestDescription);

    // Determine predicted amount: use the most recent amount (or average of recent if close)
    const recentTxs = group.transactions.slice(-3);
    const averageAmount =
      recentTxs.reduce((sum, t) => sum + t.amount, 0) / recentTxs.length;
    const predictedRawAmount = latestTx.amount;
    const flowType = classifyFlowType(group.latestDescription, predictedRawAmount);
    const predictedAmount = Math.abs(predictedRawAmount);

    // Project forward occurrences
    let currentProjection = new Date(latestTx.date.getTime());
    const targetDayOfMonth = latestTx.date.getDate();

    const advanceStep = (d: Date): Date => {
      if (isMonthly) {
        const curYear = d.getFullYear();
        const curMonth = d.getMonth();
        const nextMonth = curMonth + 1;
        const daysInNextMonth = new Date(curYear, nextMonth + 1, 0).getDate();
        const clampedDay = Math.min(targetDayOfMonth, daysInNextMonth);
        return new Date(curYear, nextMonth, clampedDay, 12, 0, 0);
      }
      return new Date(d.getTime() + stepDays * 24 * 60 * 60 * 1000);
    };

    // Advance until strictly >= referenceDate
    let safetyCounter = 0;
    while (currentProjection < referenceDate && safetyCounter < 100) {
      currentProjection = advanceStep(currentProjection);
      safetyCounter += 1;
    }

    // Collect all occurrences within [referenceDate, endWindowDate]
    let cycleCount = 0;
    while (currentProjection <= endWindowDate && cycleCount < 10) {
      if (currentProjection >= referenceDate) {
        const yearStr = currentProjection.getFullYear();
        const monthStr = String(currentProjection.getMonth() + 1).padStart(2, '0');
        const dayStr = String(currentProjection.getDate()).padStart(2, '0');
        const nextDateStr = `${yearStr}-${monthStr}-${dayStr}`;

        const diffTime = currentProjection.getTime() - referenceDate.getTime();
        const daysUntilDue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const lastYearStr = latestTx.date.getFullYear();
        const lastMonthStr = String(latestTx.date.getMonth() + 1).padStart(2, '0');
        const lastDayStr = String(latestTx.date.getDate()).padStart(2, '0');
        const lastPaymentDateStr = `${lastYearStr}-${lastMonthStr}-${lastDayStr}`;

        predictions.push({
          id: `${group.accountId}-${group.normalizedDesc}-${nextDateStr}-${cycleCount}`,
          streamKey,
          isTracked,
          accountId: group.accountId,
          accountName: group.accountName,
          accountCode: group.accountCode,
          description: group.latestDescription,
          amount: Number(predictedAmount.toFixed(2)),
          rawAmount: predictedRawAmount,
          flowType,
          nextDate: nextDateStr,
          daysUntilDue,
          cadence,
          confidence,
          occurrences: group.transactions.length,
          lastPaymentDate: lastPaymentDateStr,
          averageAmount: Number(Math.abs(averageAmount).toFixed(2)),
        });
      }

      currentProjection = advanceStep(currentProjection);
      cycleCount += 1;
    }
  }

  // Sort upcoming payments: Tracked/Important items first, then soonest nextDate first
  predictions.sort((a, b) => {
    const aTracked = a.isTracked ? 1 : 0;
    const bTracked = b.isTracked ? 1 : 0;
    if (aTracked !== bTracked) {
      return bTracked - aTracked;
    }
    if (a.nextDate !== b.nextDate) {
      return a.nextDate.localeCompare(b.nextDate);
    }
    return b.amount - a.amount;
  });

  return predictions;
};

/**
 * Computes high-level summary KPIs for a list of predicted payments.
 */
export const computeForecastSummary = (predictions: PredictedPayment[]): ForecastSummary => {
  let totalUpcomingPayments = 0;
  let upcomingPaymentCount = 0;
  let totalTrackedPayments = 0;
  let trackedPaymentCount = 0;
  let totalUpcomingIncome = 0;
  let upcomingIncomeCount = 0;
  let nextDuePayment: PredictedPayment | null = null;
  let nextDueTrackedPayment: PredictedPayment | null = null;

  for (const pred of predictions) {
    if (pred.flowType === 'expense') {
      totalUpcomingPayments += pred.amount;
      upcomingPaymentCount += 1;
      if (!nextDuePayment) {
        nextDuePayment = pred;
      }
      if (pred.isTracked) {
        totalTrackedPayments += pred.amount;
        trackedPaymentCount += 1;
        if (!nextDueTrackedPayment) {
          nextDueTrackedPayment = pred;
        }
      }
    } else {
      totalUpcomingIncome += pred.amount;
      upcomingIncomeCount += 1;
    }
  }

  const netForecast = totalUpcomingIncome - totalUpcomingPayments;
  const averagePaymentAmount =
    upcomingPaymentCount > 0 ? totalUpcomingPayments / upcomingPaymentCount : 0;

  return {
    totalUpcomingPayments: Number(totalUpcomingPayments.toFixed(2)),
    upcomingPaymentCount,
    totalTrackedPayments: Number(totalTrackedPayments.toFixed(2)),
    trackedPaymentCount,
    totalUpcomingIncome: Number(totalUpcomingIncome.toFixed(2)),
    upcomingIncomeCount,
    netForecast: Number(netForecast.toFixed(2)),
    nextDuePayment,
    nextDueTrackedPayment,
    averagePaymentAmount: Number(averagePaymentAmount.toFixed(2)),
  };
};

/**
 * Helper to display human-friendly relative due descriptions like "Today", "Tomorrow", "In 4 days".
 */
export const formatRelativeDueDays = (daysUntilDue: number): string => {
  if (daysUntilDue === 0) return 'Due Today';
  if (daysUntilDue === 1) return 'Due Tomorrow';
  if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
  const weeks = Math.round(daysUntilDue / 7);
  if (weeks === 1) return 'Due in 1 week';
  if (daysUntilDue < 30) return `Due in ${daysUntilDue} days`;
  return `Due in ~${weeks} weeks`;
};
