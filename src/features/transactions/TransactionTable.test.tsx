import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionTable from './TransactionTable';
import type { Transaction } from './types';
import type { PaginationMeta } from '../../types/pagination';

const transactions: Transaction[] = [
  {
    id: 1,
    accountId: 10,
    transactionTypeId: 2,
    transactionTypeName: 'Debit',
    datetime: '2026-04-03 00:00:00',
    amount: 99.99,
    description: 'Grocery run',
    fingerprint: 'fp1',
  },
];

const pagination: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

const defaultProps = {
  transactions,
  expandedIds: [],
  subTransactionsByTransactionId: {},
  pagination,
  getAccountName: (id: number) => `Account ${id}`,
  onToggleExpand: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onEditSub: vi.fn(),
  onDeleteSub: vi.fn(),
  onCreateSub: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('TransactionTable', () => {
  it('renders column headers', () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders transaction rows', () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText('Grocery run')).toBeInTheDocument();
    expect(screen.getByText('Account 10')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<TransactionTable {...defaultProps} pagination={{ ...pagination, totalCount: 50, totalPages: 5 }} />);
    // PaginationControls renders a page size combobox and an items count
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/50 items/i)).toBeInTheDocument();
  });

  it('renders an empty table body when transactions list is empty', () => {
    render(<TransactionTable {...defaultProps} transactions={[]} />);
    expect(screen.queryByText('Grocery run')).not.toBeInTheDocument();
  });
});
