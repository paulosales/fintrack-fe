import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TransactionCategoryTotalsTableRow from './TransactionCategoryTotalsTableRow';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailState } from './types';

const row: TransactionCategoryTotal = {
  year: 2026,
  month: 4,
  monthLabel: '2026-04',
  categoryId: 1,
  category: 'Groceries',
  totalAmount: -150,
};

const emptyDetailsState: TransactionCategoryTotalDetailState = {
  loading: false,
  error: null,
  data: [],
};

const renderRow = (
  props: Partial<React.ComponentProps<typeof TransactionCategoryTotalsTableRow>> = {}
) =>
  render(
    <table>
      <tbody>
        <TransactionCategoryTotalsTableRow
          row={row}
          expanded={false}
          detailsState={emptyDetailsState}
          onToggle={vi.fn()}
          {...props}
        />
      </tbody>
    </table>
  );

describe('TransactionCategoryTotalsTableRow', () => {
  it('renders month, category, and total amount', () => {
    renderRow();
    expect(screen.getByText('2026-04')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('-$150.00')).toBeInTheDocument();
  });

  it('renders expand button when not expanded', () => {
    renderRow();
    expect(screen.getByRole('button', { name: /expand row/i })).toBeInTheDocument();
  });

  it('renders collapse button when expanded', () => {
    renderRow({ expanded: true });
    expect(screen.getByRole('button', { name: /collapse row/i })).toBeInTheDocument();
  });

  it('calls onToggle with the row when expand button is clicked', () => {
    const onToggle = vi.fn();
    renderRow({ onToggle });
    fireEvent.click(screen.getByRole('button', { name: /expand row/i }));
    expect(onToggle).toHaveBeenCalledWith(row);
  });
});
