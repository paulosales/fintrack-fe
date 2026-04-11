import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SubTransactionTable from './SubTransactionTable';
import type { SubTransaction } from './types';

const subTransactions: SubTransaction[] = [
  {
    id: 1,
    transactionId: 100,
    productCode: 'P1',
    description: 'Apple',
    amount: 1.5,
    note: 'fresh',
    categories: 'Groceries',
  },
  {
    id: 2,
    transactionId: 100,
    productCode: null,
    description: 'Bus ticket',
    amount: 2.0,
    note: null,
    categories: null,
  },
];

const defaultProps = {
  transactionId: 100,
  subTransactions,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCreate: vi.fn(),
};

describe('SubTransactionTable', () => {
  it('renders all sub-transaction rows', () => {
    render(<SubTransactionTable {...defaultProps} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Bus ticket')).toBeInTheDocument();
  });

  it('renders formatted amounts', () => {
    render(<SubTransactionTable {...defaultProps} />);
    expect(screen.getByText('$1.50')).toBeInTheDocument();
    expect(screen.getByText('$2.00')).toBeInTheDocument();
  });

  it('calls onEdit with the correct sub-transaction when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<SubTransactionTable {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'edit sub 1' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1, transactionId: 100 }));
  });

  it('calls onDelete with the correct ids when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<SubTransactionTable {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'delete sub 2' }));
    expect(onDelete).toHaveBeenCalledWith(2, 100);
  });

  it('calls onCreate with the transactionId when add button is clicked', () => {
    const onCreate = vi.fn();
    render(<SubTransactionTable {...defaultProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: /add sub-transaction/i }));
    expect(onCreate).toHaveBeenCalledWith(100);
  });

  it('renders an empty table when subTransactions is empty', () => {
    render(<SubTransactionTable {...defaultProps} subTransactions={[]} />);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add sub-transaction/i })).toBeInTheDocument();
  });

  it('shows dash for missing productCode and categories', () => {
    render(<SubTransactionTable {...defaultProps} />);
    // Sub id=2 has no productCode or categories
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
