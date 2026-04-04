import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TransactionFilters from './TransactionFilters';
import type { TransactionFiltersProps } from './types';

const createProps = (): TransactionFiltersProps => ({
  filters: {
    accountId: null,
    transactionTypeId: null,
    categoryId: null,
    description: '',
    descriptionInput: '',
    page: 1,
    pageSize: 10,
  },
  options: {
    accounts: [],
    transactionTypes: [],
    categories: [],
  },
  loadingState: {
    accounts: false,
    transactionTypes: false,
    categories: false,
    transactions: false,
  },
  actions: {
    onAccountChange: vi.fn(),
    onTransactionTypeChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onReload: vi.fn(),
  },
});

describe('TransactionFilters', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('forwards description input changes immediately', () => {
    const props = createProps();

    render(<TransactionFilters {...props} />);

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Coffee' },
    });

    expect(props.actions.onDescriptionChange).toHaveBeenCalledWith('Coffee');
  });
});