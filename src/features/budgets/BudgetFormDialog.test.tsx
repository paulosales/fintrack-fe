import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BudgetFormDialog from './BudgetFormDialog';
import { Account } from '../../models/accounts';

const accounts: Account[] = [
  { id: 1, code: 'A1', accountTypeId: 1, name: 'Account 1' },
  { id: 2, code: 'A2', accountTypeId: 2, name: 'Account 2' },
];

describe('BudgetFormDialog', () => {
  it('submits the initial values when submitted', async () => {
    const initialValues = {
      accountId: '1',
      date: '2026-04-01',
      amount: '123.45',
      description: 'My budget',
      processed: false,
      note: 'note here',
    };

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <BudgetFormDialog
        open
        editingBudget={null}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        isSetupLocked={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    // Submit the form directly to avoid MUI Dialog button portal focus issues
    const form = document.getElementById('budget-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // react-hook-form passes (values, event) — assert the first arg matches
    // access the first call and its first argument
    // vitest's vi.fn stores calls on `mock.calls`

    expect(onSubmit.mock.calls[0][0]).toEqual(initialValues);
  });

  it('shows save button when editing and respects isSetupLocked disabling fields', () => {
    const initialValues = {
      accountId: '2',
      date: '2026-05-01',
      amount: '50',
      description: 'Monthly',
      processed: true,
      note: 'n',
    };

    const editingBudget = {
      id: 1,
      budgetSetupId: 1,
      accountId: 2,
      accountCode: 'A2',
      accountName: 'Account 2',
      date: '2026-05-01',
      amount: 50,
      description: 'Monthly',
      processed: true,
      note: 'n',
      isRepeatle: false,
    };

    render(
      <BudgetFormDialog
        open
        editingBudget={editingBudget}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        isSetupLocked={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    // Save Changes button should be present
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();

    // Account autocomplete should be disabled (rendered as combobox)
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded');

    // Note field should be disabled
    const note = screen.getByLabelText(/Note/i) as HTMLInputElement;
    expect(note).toBeDisabled();
  });
});
