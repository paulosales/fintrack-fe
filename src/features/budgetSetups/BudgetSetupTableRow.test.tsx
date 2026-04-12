import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BudgetSetupTableRow from './BudgetSetupTableRow';
import type { BudgetSetupRecord } from './types';

const budgetSetup: BudgetSetupRecord = {
  id: 5,
  accountId: 10,
  accountCode: 'CHK',
  accountName: 'Checking',
  date: '2026-04-16',
  isRepeatle: true,
  repeatFrequency: 'MONTHLY',
  endDate: '2026-12-16',
  description: 'Rent',
  amount: -1200,
  note: 'auto-pay',
};

const renderRow = (props: Partial<React.ComponentProps<typeof BudgetSetupTableRow>> = {}) =>
  render(
    <table>
      <tbody>
        <BudgetSetupTableRow
          budgetSetup={budgetSetup}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          {...props}
        />
      </tbody>
    </table>
  );

describe('BudgetSetupTableRow', () => {
  it('renders budget setup data in cells', () => {
    renderRow();
    expect(screen.getByText('CHK - Checking')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('-$1,200.00')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
    expect(screen.getByText('auto-pay')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders "No" when isRepeatle is false', () => {
    renderRow({ budgetSetup: { ...budgetSetup, isRepeatle: false } });
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows "-" for null repeatFrequency and null note', () => {
    renderRow({ budgetSetup: { ...budgetSetup, repeatFrequency: null, note: null } });
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });

  it('shows "-" for null endDate', () => {
    renderRow({ budgetSetup: { ...budgetSetup, endDate: null } });
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onEdit with the budget setup when edit button is clicked', () => {
    const onEdit = vi.fn();
    renderRow({ onEdit });
    fireEvent.click(screen.getByRole('button', { name: /edit budget setup 5/i }));
    expect(onEdit).toHaveBeenCalledWith(budgetSetup);
  });

  it('calls onDelete with the budget setup when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderRow({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: /delete budget setup 5/i }));
    expect(onDelete).toHaveBeenCalledWith(budgetSetup);
  });
});
