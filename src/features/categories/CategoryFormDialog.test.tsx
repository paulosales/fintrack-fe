import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CategoryFormDialog from './CategoryFormDialog';
import type { CategoryMutationPayload } from '../../models/categories';

const defaultProps = {
  open: true,
  editingCategory: null,
  initialValues: { name: '' } as CategoryMutationPayload,
  formError: null,
  isSubmitting: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('CategoryFormDialog', () => {
  it('renders Create Category title when no editingCategory', () => {
    render(<CategoryFormDialog {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Create Category' })).toBeInTheDocument();
  });

  it('renders Edit Category title when editingCategory is provided', () => {
    render(<CategoryFormDialog {...defaultProps} editingCategory={{ id: 1, name: 'Food' }} />);
    expect(screen.getByText('Edit Category')).toBeInTheDocument();
  });

  it('displays formError in an alert', () => {
    render(<CategoryFormDialog {...defaultProps} formError="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render an alert when formError is null', () => {
    render(<CategoryFormDialog {...defaultProps} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('populates the Name field with initialValues', () => {
    render(<CategoryFormDialog {...defaultProps} initialValues={{ name: 'Groceries' }} />);
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Groceries');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<CategoryFormDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables buttons while isSubmitting', () => {
    render(<CategoryFormDialog {...defaultProps} isSubmitting />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /create category/i })).toBeDisabled();
  });

  it('shows Save Changes button in edit mode', () => {
    render(<CategoryFormDialog {...defaultProps} editingCategory={{ id: 1, name: 'Food' }} />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
