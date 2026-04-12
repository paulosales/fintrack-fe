import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionCategoryTotalDetailTable from './TransactionCategoryTotalDetailTable';
import type { TransactionCategoryTotalDetailState } from './types';

const loadingState: TransactionCategoryTotalDetailState = {
  loading: true,
  error: null,
  data: [],
};

const errorState: TransactionCategoryTotalDetailState = {
  loading: false,
  error: 'Something went wrong',
  data: [],
};

const emptyState: TransactionCategoryTotalDetailState = {
  loading: false,
  error: null,
  data: [],
};

const dataState: TransactionCategoryTotalDetailState = {
  loading: false,
  error: null,
  data: [
    {
      id: 10,
      type: 'transaction',
      year: 2026,
      month: 4,
      monthLabel: '2026-04',
      description: 'Market',
      datetime: '2026-04-03 13:45:00',
      note: 'weekly shop',
      categoryId: 1,
      category: 'Groceries',
      amount: -100,
    },
  ],
};

describe('TransactionCategoryTotalDetailTable', () => {
  it('renders loading spinner when loading', () => {
    render(<TransactionCategoryTotalDetailTable detailsState={loadingState} />);
    expect(document.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('renders error alert when there is an error', () => {
    render(<TransactionCategoryTotalDetailTable detailsState={errorState} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders empty info alert when data is empty and not loading', () => {
    render(<TransactionCategoryTotalDetailTable detailsState={emptyState} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders detail rows when data is present', () => {
    render(<TransactionCategoryTotalDetailTable detailsState={dataState} />);
    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
    expect(screen.getByText('weekly shop')).toBeInTheDocument();
    expect(screen.getByText('2026-04-03 13:45:00')).toBeInTheDocument();
  });

  it('renders "-" for empty note', () => {
    const stateWithEmptyNote: TransactionCategoryTotalDetailState = {
      ...dataState,
      data: [{ ...dataState.data[0], note: '' }],
    };
    render(<TransactionCategoryTotalDetailTable detailsState={stateWithEmptyNote} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders column headers when data is present', () => {
    render(<TransactionCategoryTotalDetailTable detailsState={dataState} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });
});
