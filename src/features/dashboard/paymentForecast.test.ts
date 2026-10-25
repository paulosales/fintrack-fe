import { describe, it, expect } from 'vitest';
import {
  normalizeDescription,
  classifyFlowType,
  isDefaultImportantDescription,
  predictUpcomingPayments,
  computeForecastSummary,
  formatRelativeDueDays,
} from './paymentForecast';
import type { Account } from '../../models/accounts';
import type { Transaction } from '../transactions/types';

describe('paymentForecast', () => {
  describe('normalizeDescription', () => {
    it('normalizes store names and removes artifacts like trailing nan', () => {
      expect(normalizeDescription('ONLINE BANKING PAYMENT - 8475 MBNA-MASTERCARD nan')).toBe(
        'ONLINE BANKING PAYMENT - 8475 MBNA-MASTERCARD'
      );
    });

    it('removes phone numbers', () => {
      expect(normalizeDescription('FIDO Mobile ******3170 888-481-3436')).toBe('FIDO MOBILE');
    });

    it('removes store numbers and mask asterisks', () => {
      expect(normalizeDescription('COSTCO WHOLESALE #549 WINNIPEG')).toBe('COSTCO WHOLESALE WINNIPEG');
    });

    it('handles empty or whitespace strings', () => {
      expect(normalizeDescription('')).toBe('');
      expect(normalizeDescription('   ')).toBe('');
    });
  });

  describe('isDefaultImportantDescription', () => {
    it('identifies insurance, rent, mortgage, auto loan, and credit card payments as important', () => {
      expect(isDefaultImportantDescription('AUTO INSURANCE MPI AUTOPAC PMT')).toBe(true);
      expect(isDefaultImportantDescription('RENT/LEASE WRE DEVELOPMENT')).toBe(true);
      expect(isDefaultImportantDescription('AUTO PAYMENT WE SELL AUTOS')).toBe(true);
      expect(isDefaultImportantDescription('ONLINE BANKING PAYMENT - 8475 MBNA-MASTERCARD')).toBe(true);
      expect(isDefaultImportantDescription('Payment RBC')).toBe(true);
      expect(isDefaultImportantDescription('Pagamento de Boleto')).toBe(true);
    });

    it('returns false for casual discretionary expenses', () => {
      expect(isDefaultImportantDescription('MCDONALDS')).toBe(false);
      expect(isDefaultImportantDescription('COINAMATIC')).toBe(false);
      expect(isDefaultImportantDescription('DOLLARAMA')).toBe(false);
    });
  });

  describe('classifyFlowType', () => {
    it('classifies payroll and interest as income', () => {
      expect(classifyFlowType('PAYROLL DEPOSIT POLLARD BANKNOT', 2373.67)).toBe('income');
      expect(classifyFlowType('Branch Transaction INTEREST', 0.07)).toBe('income');
    });

    it('classifies bills, subscriptions, and fees as expense', () => {
      expect(classifyFlowType('NETFLIX.COM', -26.87)).toBe('expense');
      expect(classifyFlowType('AUTO INSURANCE MPI AUTOPAC PMT', -252.58)).toBe('expense');
      expect(classifyFlowType('MONTHLY FEE', -12.95)).toBe('expense');
      expect(classifyFlowType('FIDO Mobile', 113.2)).toBe('expense');
    });

    it('falls back to raw amount sign when keywords do not match', () => {
      expect(classifyFlowType('UNKNOWN MERCHANT', -50)).toBe('expense');
      expect(classifyFlowType('UNKNOWN SENDER', 100)).toBe('income');
    });
  });

  describe('predictUpcomingPayments', () => {
    const mockAccounts: Account[] = [
      { id: 1, code: 'PCFIN', name: 'PC Financial', accountTypeId: 1 },
      { id: 2, code: 'RBCCHEK', name: 'RBC Checking', accountTypeId: 2 },
    ];

    const referenceDate = new Date(2026, 9, 24); // Oct 24, 2026

    it('predicts monthly bills accurately and assigns streamKey and isTracked', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 101,
          accountId: 2,
          transactionTypeId: 1,
          datetime: '2026-07-28 12:00:00',
          amount: -25.0,
          description: 'NETFLIX.COM',
          fingerprint: 'fp1',
        },
        {
          id: 102,
          accountId: 2,
          transactionTypeId: 1,
          datetime: '2026-08-28 12:00:00',
          amount: -25.0,
          description: 'NETFLIX.COM',
          fingerprint: 'fp2',
        },
        {
          id: 103,
          accountId: 2,
          transactionTypeId: 1,
          datetime: '2026-09-28 12:00:00',
          amount: -26.87,
          description: 'NETFLIX.COM',
          fingerprint: 'fp3',
        },
      ];

      const predictions = predictUpcomingPayments(mockTransactions, mockAccounts, {
        referenceDate,
        windowDays: 30,
      });

      expect(predictions.length).toBeGreaterThan(0);
      const netflix = predictions.find((p) => p.description.includes('NETFLIX'));
      expect(netflix).toBeDefined();
      expect(netflix?.nextDate).toBe('2026-10-28');
      expect(netflix?.amount).toBe(26.87);
      expect(netflix?.accountName).toBe('RBC Checking');
      expect(netflix?.cadence).toBe('Monthly');
      expect(netflix?.daysUntilDue).toBe(4);
      expect(netflix?.streamKey).toBe('2:::NETFLIX.COM');
      expect(netflix?.isTracked).toBe(false);
    });

    it('orders important/tracked payments before untracked payments', () => {
      const mockTransactions: Transaction[] = [
        // NETFLIX is on Oct 25 (earlier date, but not tracked by default)
        {
          id: 1,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-08-25 12:00:00',
          amount: -26.87,
          description: 'NETFLIX.COM',
          fingerprint: 'n1',
        },
        {
          id: 2,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-09-25 12:00:00',
          amount: -26.87,
          description: 'NETFLIX.COM',
          fingerprint: 'n2',
        },
        // AUTO INSURANCE is on Nov 15 (later date, but tracked/important by default)
        {
          id: 3,
          accountId: 2,
          transactionTypeId: 1,
          datetime: '2026-08-15 12:00:00',
          amount: -252.58,
          description: 'AUTO INSURANCE MPI AUTOPAC PMT',
          fingerprint: 'i1',
        },
        {
          id: 4,
          accountId: 2,
          transactionTypeId: 1,
          datetime: '2026-09-15 12:00:00',
          amount: -252.58,
          description: 'AUTO INSURANCE MPI AUTOPAC PMT',
          fingerprint: 'i2',
        },
      ];

      const predictions = predictUpcomingPayments(mockTransactions, mockAccounts, {
        referenceDate,
        windowDays: 30,
      });

      expect(predictions.length).toBe(2);
      // Insurance is important -> comes FIRST even though its date (Nov 15) is after Netflix (Oct 25)
      expect(predictions[0].description).toBe('AUTO INSURANCE MPI AUTOPAC PMT');
      expect(predictions[0].isTracked).toBe(true);
      expect(predictions[1].description).toBe('NETFLIX.COM');
      expect(predictions[1].isTracked).toBe(false);
    });

    it('respects custom trackedStreamKeys override', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-08-25 12:00:00',
          amount: -26.87,
          description: 'NETFLIX.COM',
          fingerprint: 'n1',
        },
        {
          id: 2,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-09-25 12:00:00',
          amount: -26.87,
          description: 'NETFLIX.COM',
          fingerprint: 'n2',
        },
      ];

      // Explicitly mark NETFLIX as tracked
      const customTracked = new Set(['1:::NETFLIX.COM']);
      const predictions = predictUpcomingPayments(mockTransactions, mockAccounts, {
        referenceDate,
        windowDays: 30,
        trackedStreamKeys: customTracked,
      });

      expect(predictions[0].isTracked).toBe(true);
    });

    it('predicts bi-weekly expenses with multiple occurrences within 30 days', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 201,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-09-08 10:00:00',
          amount: -16.71,
          description: 'FIT4LESS',
          fingerprint: 'fit1',
        },
        {
          id: 202,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-09-22 10:00:00',
          amount: -16.71,
          description: 'FIT4LESS',
          fingerprint: 'fit2',
        },
        {
          id: 203,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2026-10-06 10:00:00',
          amount: -16.71,
          description: 'FIT4LESS',
          fingerprint: 'fit3',
        },
      ];

      const predictions = predictUpcomingPayments(mockTransactions, mockAccounts, {
        referenceDate,
        windowDays: 30,
      });

      const gymPayments = predictions.filter((p) => p.description.includes('FIT4LESS'));
      expect(gymPayments.length).toBe(2);
      expect(gymPayments[0].nextDate).toBe('2026-11-03');
      expect(gymPayments[1].nextDate).toBe('2026-11-17');
      expect(gymPayments[0].amount).toBe(16.71);
      expect(gymPayments[0].cadence).toBe('Bi-weekly');
    });

    it('ignores defunct transactions that have not occurred in a long time', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 301,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2024-01-15 12:00:00',
          amount: -50.0,
          description: 'CANCELLED SERVICE',
          fingerprint: 'cs1',
        },
        {
          id: 302,
          accountId: 1,
          transactionTypeId: 1,
          datetime: '2024-02-15 12:00:00',
          amount: -50.0,
          description: 'CANCELLED SERVICE',
          fingerprint: 'cs2',
        },
      ];

      const predictions = predictUpcomingPayments(mockTransactions, mockAccounts, {
        referenceDate,
        windowDays: 30,
      });

      expect(predictions.some((p) => p.description.includes('CANCELLED'))).toBe(false);
    });
  });

  describe('computeForecastSummary', () => {
    it('computes correct aggregates for payments, income, and tracked streams', () => {
      const samplePredictions = [
        {
          id: '1',
          streamKey: '1:::NETFLIX',
          isTracked: false,
          accountId: 1,
          accountName: 'PC Financial',
          description: 'NETFLIX',
          amount: 25.0,
          rawAmount: -25.0,
          flowType: 'expense' as const,
          nextDate: '2026-10-28',
          daysUntilDue: 4,
          cadence: 'Monthly' as const,
          confidence: 'High' as const,
          occurrences: 4,
          lastPaymentDate: '2026-09-28',
          averageAmount: 25.0,
        },
        {
          id: '2',
          streamKey: '2:::RENT',
          isTracked: true,
          accountId: 2,
          accountName: 'RBC Checking',
          description: 'RENT',
          amount: 1500.0,
          rawAmount: -1500.0,
          flowType: 'expense' as const,
          nextDate: '2026-11-01',
          daysUntilDue: 8,
          cadence: 'Monthly' as const,
          confidence: 'High' as const,
          occurrences: 5,
          lastPaymentDate: '2026-10-01',
          averageAmount: 1500.0,
        },
        {
          id: '3',
          streamKey: '2:::PAYROLL',
          isTracked: false,
          accountId: 2,
          accountName: 'RBC Checking',
          description: 'PAYROLL',
          amount: 2000.0,
          rawAmount: 2000.0,
          flowType: 'income' as const,
          nextDate: '2026-11-06',
          daysUntilDue: 13,
          cadence: 'Bi-weekly' as const,
          confidence: 'High' as const,
          occurrences: 8,
          lastPaymentDate: '2026-10-23',
          averageAmount: 2000.0,
        },
      ];

      const summary = computeForecastSummary(samplePredictions);
      expect(summary.totalUpcomingPayments).toBe(1525.0);
      expect(summary.upcomingPaymentCount).toBe(2);
      expect(summary.totalTrackedPayments).toBe(1500.0);
      expect(summary.trackedPaymentCount).toBe(1);
      expect(summary.nextDueTrackedPayment?.description).toBe('RENT');
      expect(summary.totalUpcomingIncome).toBe(2000.0);
      expect(summary.upcomingIncomeCount).toBe(1);
      expect(summary.netForecast).toBe(475.0);
      expect(summary.nextDuePayment?.description).toBe('NETFLIX');
      expect(summary.averagePaymentAmount).toBe(762.5);
    });
  });

  describe('formatRelativeDueDays', () => {
    it('formats 0 as Due Today', () => {
      expect(formatRelativeDueDays(0)).toBe('Due Today');
    });

    it('formats 1 as Due Tomorrow', () => {
      expect(formatRelativeDueDays(1)).toBe('Due Tomorrow');
    });

    it('formats small day counts as Due in X days', () => {
      expect(formatRelativeDueDays(4)).toBe('Due in 4 days');
    });

    it('formats 7 as Due in 7 days', () => {
      expect(formatRelativeDueDays(7)).toBe('Due in 7 days');
    });
  });
});
