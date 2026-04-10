import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionFormDialog from './TransactionFormDialog';
import { TransactionType } from '../../models/transactionTypes';
import { Transaction } from './types';

const accounts = [
  { id: 1, code: 'A1', accountTypeId: 1, name: 'Account 1' },
  { id: 2, code: 'A2', accountTypeId: 2, name: 'Account 2' },
];

const transactionTypes: TransactionType[] = [
  { id: 1, code: 'A', name: 'Type A' },
  { id: 2, code: 'B', name: 'Type B' },
];

const categories = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Utilities' },
];

describe('TransactionFormDialog', () => {
  it('submits initial values', async () => {
    const initialValues = {
      accountId: '1',
      transactionTypeId: '2',
      categoryIds: ['1'],
      datetime: '2026-04-07T12:00',
      amount: '12.34',
      description: 'Coffee',
      note: 'note',
    };

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <TransactionFormDialog
        open
        editingTransaction={null}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        transactionTypes={transactionTypes}
        categories={categories}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    // submit form directly to avoid dialog portal issues
    const form = document.getElementById('transaction-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // react-hook-form passes (values, event) — assert first arg
    expect(onSubmit.mock.calls[0][0]).toEqual(initialValues);
  });

  it('shows Save Changes when editingTransaction is provided', () => {
    const initialValues = {
      accountId: '1',
      transactionTypeId: '1',
      categoryIds: [],
      datetime: '2026-04-07T12:00',
      amount: '0',
      description: '',
      note: '',
    };

    const editing: Transaction = {
      id: 1,
      accountId: 1,
      transactionTypeId: 1,
      categoryIds: '',
      datetime: '2026-04-07 12:00:00',
      amount: 0,
      description: '',
      fingerprint: 'f',
    };

    render(
      <TransactionFormDialog
        open
        editingTransaction={editing}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        transactionTypes={transactionTypes}
        categories={categories}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});
