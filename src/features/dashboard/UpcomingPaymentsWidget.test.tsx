import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpcomingPaymentsWidget } from './UpcomingPaymentsWidget';
import type { Account } from '../../models/accounts';
import type { Transaction } from '../transactions/types';

describe('UpcomingPaymentsWidget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockAccounts: Account[] = [
    { id: 1, code: 'PCFIN', name: 'PC Financial', accountTypeId: 1 },
    { id: 2, code: 'RBCCHEK', name: 'RBC Checking', accountTypeId: 2 },
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const d1 = new Date(year, month - 2, day);
  const d2 = new Date(year, month - 1, day);

  const formatTestDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 12:00:00`;

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      accountId: 2,
      transactionTypeId: 1,
      datetime: formatTestDate(d1),
      amount: -252.58,
      description: 'AUTO INSURANCE MPI AUTOPAC PMT',
      fingerprint: 'ins1',
    },
    {
      id: 2,
      accountId: 2,
      transactionTypeId: 1,
      datetime: formatTestDate(d2),
      amount: -252.58,
      description: 'AUTO INSURANCE MPI AUTOPAC PMT',
      fingerprint: 'ins2',
    },
    {
      id: 3,
      accountId: 1,
      transactionTypeId: 1,
      datetime: formatTestDate(d1),
      amount: -26.87,
      description: 'NETFLIX.COM',
      fingerprint: 'net1',
    },
    {
      id: 4,
      accountId: 1,
      transactionTypeId: 1,
      datetime: formatTestDate(d2),
      amount: -26.87,
      description: 'NETFLIX.COM',
      fingerprint: 'net2',
    },
  ];

  it('renders widget title, KPI metrics, and places tracked/important payments first', () => {
    render(
      <UpcomingPaymentsWidget
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
      />
    );

    expect(screen.getByText('Upcoming Payments Forecast')).toBeInTheDocument();
    expect(screen.getByText('Tracked Payments Due')).toBeInTheDocument();
    expect(screen.getByText('Next Important Bill')).toBeInTheDocument();

    // AUTO INSURANCE is an important payment by default -> should be displayed and marked
    expect(screen.getByText('AUTO INSURANCE MPI AUTOPAC PMT')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
  });

  it('allows toggling a line as tracked/important via star button', () => {
    render(
      <UpcomingPaymentsWidget
        transactions={mockTransactions}
        accounts={mockAccounts}
      />
    );

    // Switch to All Bills so NETFLIX is visible
    const allBillsBtn = screen.getByRole('button', { name: /all bills/i });
    fireEvent.click(allBillsBtn);

    expect(screen.getByText('NETFLIX.COM')).toBeInTheDocument();

    // Find the track button for Netflix
    const trackNetflixBtn = screen.getByRole('button', { name: /track netflix/i });
    fireEvent.click(trackNetflixBtn);

    // It should now be saved to localStorage
    const saved = localStorage.getItem('fintrack-forecast-tracked-streams');
    expect(saved).toBeTruthy();
    expect(saved).toContain('1:::NETFLIX.COM');
  });

  it('filters payments when Tracked Only view is active', () => {
    render(
      <UpcomingPaymentsWidget
        transactions={mockTransactions}
        accounts={mockAccounts}
      />
    );

    // Default view is Tracked Only
    expect(screen.getByText('AUTO INSURANCE MPI AUTOPAC PMT')).toBeInTheDocument();
    expect(screen.queryByText('NETFLIX.COM')).not.toBeInTheDocument();

    // Switch to All Bills
    const allBillsBtn = screen.getByRole('button', { name: /all bills/i });
    fireEvent.click(allBillsBtn);
    expect(screen.getByText('NETFLIX.COM')).toBeInTheDocument();
  });

  it('filters payments via search input', () => {
    render(
      <UpcomingPaymentsWidget
        transactions={mockTransactions}
        accounts={mockAccounts}
      />
    );

    const searchInput = screen.getByPlaceholderText(/filter by description or account/i);
    fireEvent.change(searchInput, { target: { value: 'INSURANCE' } });

    expect(screen.getByText('AUTO INSURANCE MPI AUTOPAC PMT')).toBeInTheDocument();
  });

  it('displays loading indicator when loading is true', () => {
    render(
      <UpcomingPaymentsWidget
        transactions={[]}
        accounts={mockAccounts}
        loading={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(
      <UpcomingPaymentsWidget
        transactions={mockTransactions}
        accounts={mockAccounts}
        onRefresh={onRefresh}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: /refresh forecast data/i });
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
