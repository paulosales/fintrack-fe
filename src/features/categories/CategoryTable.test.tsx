import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryTable from './CategoryTable';
import type { Category } from '../../models/categories';

const categories: Category[] = [
  { id: 1, name: 'Bills' },
  { id: 2, name: 'Groceries' },
];

const defaultProps = {
  categories,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('CategoryTable', () => {
  it('renders column headers', () => {
    render(<CategoryTable {...defaultProps} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders a row for each category', () => {
    render(<CategoryTable {...defaultProps} />);
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('renders no rows when categories list is empty', () => {
    render(<CategoryTable {...defaultProps} categories={[]} />);
    expect(screen.queryByText('Bills')).not.toBeInTheDocument();
  });
});
