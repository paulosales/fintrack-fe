import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BudgetGenerateDialog from './BudgetGenerateDialog';

describe('BudgetGenerateDialog', () => {
  beforeEach(() => {
    // Freeze time to a known date: 2026-04-07
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses sensible default startDate and endDate based on current date', async () => {
    render(
      <BudgetGenerateDialog
        open
        initialValues={undefined}
        formError={null}
        isSubmitting={false}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    // Labels: start uses defaultValue 'Generates from', end uses translation 'Generate Until'
    const start = screen.getByLabelText(/Generates from/i) as HTMLInputElement;
    const end = screen.getByLabelText(/Generate Until/i) as HTMLInputElement;

    // For mocked date 2026-04-07, firstOfThisMonth = 2026-04-01, lastOfThreeMonthsAhead = 2026-07-31
    expect(start.value).toBe('2026-04-01');
    expect(end.value).toBe('2026-07-31');
  });

  it('submits provided initial values when form is submitted', async () => {
    // Ensure real timers so react-hook-form async handlers run normally
    vi.useRealTimers();
    const onSubmit = vi.fn();

    const initialValues = {
      startDate: '2026-05-01',
      endDate: '2026-06-30',
    };

    render(
      <BudgetGenerateDialog
        open
        initialValues={initialValues}
        formError={null}
        isSubmitting={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />
    );

    const form = document.getElementById('budget-generate-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // react-hook-form calls onSubmit with (values, event) — assert first arg
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(onSubmit.mock.calls[0][0]).toEqual(initialValues);
  });
});
