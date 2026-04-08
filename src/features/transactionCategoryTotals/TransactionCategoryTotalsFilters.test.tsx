import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionCategoryTotalsFilters from './TransactionCategoryTotalsFilters';
import { useForm } from 'react-hook-form';
import { TransactionCategoryTotalsFiltersProps } from './types';

const Wrapper = (props: Omit<TransactionCategoryTotalsFiltersProps, 'control'>) => {
  const { control } = useForm({ defaultValues: { month: '', year: '', categoryId: '' } });
  return <TransactionCategoryTotalsFilters control={control} {...props} />;
};

describe('TransactionCategoryTotalsFilters', () => {
  it('renders controls and calls onReload', () => {
    const handlers = {
      onMonthChange: vi.fn(),
      onYearChange: vi.fn(),
      onCategoryChange: vi.fn(),
      onReload: vi.fn(),
    };

    render(
      <Wrapper
        monthOptions={[{ value: '4', label: 'April' }]}
        categories={[{ id: 1, name: 'Groceries' }]}
        categoriesLoading={false}
        loading={false}
        {...handlers}
      />
    );

    // month combobox present
    expect(screen.getByRole('combobox', { name: /Select Month/i })).toBeInTheDocument();

    // year input change calls handler
    const year = screen.getByLabelText(/Year/i) as HTMLInputElement;
    fireEvent.change(year, { target: { value: '2026' } });
    expect(handlers.onYearChange).toHaveBeenCalledWith('2026');

    // reload button triggers onReload
    const btn = screen.getByRole('button', { name: /Reload/i });
    fireEvent.click(btn);
    expect(handlers.onReload).toHaveBeenCalled();
  });

  it('disables category autocomplete while loading categories', () => {
    render(
      <Wrapper
        monthOptions={[]}
        categories={[]}
        categoriesLoading={true}
        loading={false}
        onMonthChange={() => {}}
        onYearChange={() => {}}
        onCategoryChange={() => {}}
        onReload={() => {}}
      />
    );

    const category = screen.getByLabelText(/Select Category/i) as HTMLInputElement;
    expect(category).toBeDisabled();
  });
});
