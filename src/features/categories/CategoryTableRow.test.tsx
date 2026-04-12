import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CategoryTableRow from './CategoryTableRow';
import type { Category } from '../../models/categories';

const category: Category = { id: 7, name: 'Groceries' };

const renderRow = (props: Partial<React.ComponentProps<typeof CategoryTableRow>> = {}) =>
  render(
    <table>
      <tbody>
        <CategoryTableRow category={category} onEdit={vi.fn()} onDelete={vi.fn()} {...props} />
      </tbody>
    </table>
  );

describe('CategoryTableRow', () => {
  it('renders category id and name', () => {
    renderRow();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('calls onEdit with the category when edit button is clicked', () => {
    const onEdit = vi.fn();
    renderRow({ onEdit });
    fireEvent.click(screen.getByRole('button', { name: /edit category 7/i }));
    expect(onEdit).toHaveBeenCalledWith(category);
  });

  it('calls onDelete with the category when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderRow({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: /delete category 7/i }));
    expect(onDelete).toHaveBeenCalledWith(category);
  });
});
