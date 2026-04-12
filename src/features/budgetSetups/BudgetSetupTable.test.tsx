import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetSetupTable from './BudgetSetupTable';
import type { BudgetSetupRecord } from './types';
import type { PaginationMeta } from '../../types/pagination';

const budgetSetups: BudgetSetupRecord[] = [
  {
    id: 1,
    accountId: 10,
    accountCode: 'CHK',
    accountName: 'Checking',
    date: '2026-04-16',
    isRepeatle: true,
    repeatFrequency: 'MONTHLY',
    endDate: null,
    description: 'Insurance',
    amount: -200,
    note: null,
  },
];

const pagination: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

const defaultProps = {
  budgetSetups,
  pagination,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('BudgetSetupTable', () => {
  it('renders column headers', () => {
    render(<BudgetSetupTable {...defaultProps} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Repeating')).toBeInTheDocument();
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders a budget setup row', () => {
    render(<BudgetSetupTable {...defaultProps} />);
    expect(screen.getByText('Insurance')).toBeInTheDocument();
    expect(screen.getByText('CHK - Checking')).toBeInTheDocument();
    expect(screen.getByText('-$200.00')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(
      <BudgetSetupTable
        {...defaultProps}
        pagination={{ ...pagination, totalCount: 50, totalPages: 5 }}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/50 items/i)).toBeInTheDocument();
  });

  it('renders an empty body when budgetSetups is empty', () => {
    render(<BudgetSetupTable {...defaultProps} budgetSetups={[]} />);
    expect(screen.queryByText('Insurance')).not.toBeInTheDocument();
  });
});
