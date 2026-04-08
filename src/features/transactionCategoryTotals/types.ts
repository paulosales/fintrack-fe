import type { Category } from '../../models/categories';
import type { PaginationMeta } from '../../types/pagination';
import { type Control } from 'react-hook-form';
import { TransactionCategoryTotalsFilterFormValues } from './TransactionCategoryTotalsFilters';

export interface TransactionCategoryTotalsFilters {
  month: number | null;
  year: number | null;
  categoryId: number | null;
  page: number;
  pageSize: number;
}

export interface TransactionCategoryTotal {
  year: number;
  month: number;
  monthLabel: string;
  categoryId: number;
  category: string;
  totalAmount: number;
}

export interface TransactionCategoryTotalDetail {
  id: number;
  type: string;
  year: number;
  month: number;
  monthLabel: string;
  description: string;
  datetime: string;
  note: string;
  categoryId: number;
  category: string;
  amount: number;
}

export interface TransactionCategoryTotalDetailRequest {
  month: number;
  year: number;
  categoryId: number;
}

export interface TransactionCategoryTotalDetailState {
  loading: boolean;
  error: string | null;
  data: TransactionCategoryTotalDetail[];
}

export interface TransactionCategoryTotalsState {
  loading: boolean;
  error: string | null;
  data: TransactionCategoryTotal[];
  detailsByKey: Record<string, TransactionCategoryTotalDetailState>;
  pagination: PaginationMeta;
}

export interface TransactionCategoryTotalsFilterOptions {
  categories: Category[];
}

export const getTransactionCategoryDetailKey = ({
  year,
  month,
  categoryId,
}: TransactionCategoryTotalDetailRequest): string => `${year}-${month}-${categoryId}`;

export interface TransactionCategoryTotalsFiltersProps {
  control: Control<TransactionCategoryTotalsFilterFormValues>;
  monthOptions: Array<{ value: string | number; label: string }>;
  categories: Category[];
  categoriesLoading: boolean;
  loading: boolean;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReload: () => void;
}
