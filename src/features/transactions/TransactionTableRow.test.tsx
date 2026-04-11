import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TransactionTableRow from './TransactionTableRow';
import type { Transaction } from './types';

const transaction: Transaction = {
  id: 42,
  accountId: 1,
  transactionTypeId: 2,
  transactionTypeName: 'Debit',
  datetime: '2026-04-03 00:00:00',
  amount: 100.0,
  description: 'Groceries run',
  note: 'weekend shopping',
  categories: 'Food',
  fingerprint: 'abc123',
};

const defaultProps = {
  transaction,
  expanded: false,
  subTransactions: undefined,
  accountName: 'Main Checking',
  onToggleExpand: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onEditSub: vi.fn(),
  onDeleteSub: vi.fn(),
  onCreateSub: vi.fn(),
};

describe('TransactionTableRow', () => {
  it('renders transaction data in cells', () => {
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} />
        </tbody>
      </table>
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Main Checking')).toBeInTheDocument();
    expect(screen.getByText('Debit')).toBeInTheDocument();
    expect(screen.getByText('Groceries run')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('weekend shopping')).toBeInTheDocument();
  });

  it('shows expand button when not expanded', () => {
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} expanded={false} />
        </tbody>
      </table>
    );
    expect(screen.getByRole('button', { name: /expand row/i })).toBeInTheDocument();
  });

  it('shows collapse button when expanded', () => {
    render(
      <table>
        <tbody>
          <TransactionTableRow
            {...defaultProps}
            expanded
            subTransactions={{ loading: false, error: null, data: [] }}
          />
        </tbody>
      </table>
    );
    expect(screen.getByRole('button', { name: /collapse row/i })).toBeInTheDocument();
  });

  it('calls onToggleExpand when expand button is clicked', () => {
    const onToggleExpand = vi.fn();
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} onToggleExpand={onToggleExpand} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByRole('button', { name: /expand row/i }));
    expect(onToggleExpand).toHaveBeenCalledWith(transaction);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} onEdit={onEdit} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByRole('button', { name: /edit transaction 42/i }));
    expect(onEdit).toHaveBeenCalledWith(transaction);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByRole('button', { name: /delete transaction 42/i }));
    expect(onDelete).toHaveBeenCalledWith(transaction);
  });

  it('renders SubTransactionTable when expanded', () => {
    render(
      <table>
        <tbody>
          <TransactionTableRow
            {...defaultProps}
            expanded
            subTransactions={{ loading: false, error: null, data: [] }}
          />
        </tbody>
      </table>
    );
    expect(screen.getByRole('button', { name: /add sub-transaction/i })).toBeInTheDocument();
  });

  it('does not render SubTransactionTable when not expanded', () => {
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} expanded={false} />
        </tbody>
      </table>
    );
    expect(screen.queryByRole('button', { name: /add sub-transaction/i })).not.toBeInTheDocument();
  });

  it('shows dash for missing transactionTypeName', () => {
    const noType: Transaction = { ...transaction, transactionTypeName: undefined };
    render(
      <table>
        <tbody>
          <TransactionTableRow {...defaultProps} transaction={noType} />
        </tbody>
      </table>
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
