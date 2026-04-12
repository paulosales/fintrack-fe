import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionCategoryTotalsTable from './TransactionCategoryTotalsTable';
import type { TransactionCategoryTotal } from './types';
import type { PaginationMeta } from '../../types/pagination';

const rows: TransactionCategoryTotal[] = [
  {
    year: 2026,
    month: 4,
    monthLabel: '2026-04',
    categoryId: 1,
    category: 'Groceries',
    totalAmount: -100,
  },
  {
    year: 2026,
    month: 4,
    monthLabel: '2026-04',
    categoryId: 2,
    category: 'Bills',
    totalAmount: -200,
  },
];

const pagination: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalCount: 2,
  totalPages: 1,
};

const defaultProps = {
  rows,
  pagination,
  expandedKeys: {},
  detailsByKey: {},
  onToggle: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('TransactionCategoryTotalsTable', () => {
  it('renders column headers', () => {
    render(<TransactionCategoryTotalsTable {...defaultProps} />);
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders a row for each total', () => {
    render(<TransactionCategoryTotalsTable {...defaultProps} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
    expect(screen.getByText('-$200.00')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(
      <TransactionCategoryTotalsTable
        {...defaultProps}
        pagination={{ ...pagination, totalCount: 50, totalPages: 5 }}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/50 items/i)).toBeInTheDocument();
  });

  it('renders no rows when rows list is empty', () => {
    render(<TransactionCategoryTotalsTable {...defaultProps} rows={[]} />);
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
  });

  it('passes expanded state to the row component', () => {
    const expandedKeys = { '2026-4-1': true };
    render(<TransactionCategoryTotalsTable {...defaultProps} expandedKeys={expandedKeys} />);
    expect(screen.getByRole('button', { name: /collapse row/i })).toBeInTheDocument();
  });
});
