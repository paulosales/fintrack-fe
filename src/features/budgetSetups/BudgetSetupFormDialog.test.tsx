import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BudgetSetupFormDialog from './BudgetSetupFormDialog';
import type { Account } from '../../models/accounts';

const accounts: Account[] = [
  { id: 1, code: 'A1', accountTypeId: 1, name: 'Account 1' },
  { id: 2, code: 'A2', accountTypeId: 2, name: 'Account 2' },
];

describe('BudgetSetupFormDialog', () => {
  it('submits the initial values when submitted', async () => {
    const initialValues = {
      accountId: '1',
      date: '2026-04-01',
      isRepeatle: false,
      repeatFrequency: '',
      endDate: '',
      description: 'My setup',
      amount: '100',
      note: 'note here',
    };

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <BudgetSetupFormDialog
        open
        editingBudgetSetup={null}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const form = document.getElementById('budget-setup-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual(initialValues);
  });

  it('disables end date when not repeating and enables when toggled', () => {
    const initialValues = {
      accountId: '1',
      date: '2026-04-01',
      isRepeatle: false,
      repeatFrequency: '',
      endDate: '',
      description: 'My setup',
      amount: '100',
      note: '',
    };

    render(
      <BudgetSetupFormDialog
        open
        editingBudgetSetup={null}
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        accounts={accounts}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    const endDate = screen.getByLabelText(/End Date/i) as HTMLInputElement;
    expect(endDate).toBeDisabled();

    const repeatingCheckbox = screen.getByLabelText(/Repeating/i) as HTMLInputElement;
    fireEvent.click(repeatingCheckbox);

    expect(endDate).not.toBeDisabled();
  });
});
