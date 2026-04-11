import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SubTransactionFormDialog from './SubTransactionFormDialog';
import type { SubTransaction } from './types';
import type { Category } from '../../models/categories';

const categories: Category[] = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Transport' },
];

const editingSub: SubTransaction = {
  id: 10,
  transactionId: 5,
  productCode: 'PROD-1',
  description: 'Milk',
  amount: 4.99,
  note: 'weekly',
  categoryIds: '1,2',
};

const defaultProps = {
  open: true,
  editing: null as SubTransaction | null,
  categories,
  onClose: vi.fn(),
  onSave: vi.fn(),
  onCreate: vi.fn(),
};

describe('SubTransactionFormDialog', () => {
  it('renders Create Sub-transaction title in create mode', () => {
    render(<SubTransactionFormDialog {...defaultProps} />);
    expect(screen.getByText('Create Sub-transaction')).toBeInTheDocument();
  });

  it('renders Edit Sub-transaction title in edit mode', () => {
    render(<SubTransactionFormDialog {...defaultProps} editing={editingSub} />);
    expect(screen.getByText('Edit Sub-transaction')).toBeInTheDocument();
  });

  it('populates fields from editing sub-transaction', () => {
    render(<SubTransactionFormDialog {...defaultProps} editing={editingSub} />);
    expect(screen.getByDisplayValue('PROD-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4.99')).toBeInTheDocument();
    expect(screen.getByDisplayValue('weekly')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<SubTransactionFormDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onCreate with form values in create mode', () => {
    const onCreate = vi.fn();
    render(<SubTransactionFormDialog {...defaultProps} onCreate={onCreate} />);
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Coffee' },
    });
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '3.50' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Coffee', amount: '3.50' })
    );
  });

  it('calls onSave with merged sub-transaction in edit mode', () => {
    const onSave = vi.fn();
    render(<SubTransactionFormDialog {...defaultProps} editing={editingSub} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        transactionId: 5,
        description: 'Milk',
        amount: 4.99,
      })
    );
  });
});
