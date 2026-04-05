import type { Account } from '../../models/accounts';
import type { PaginationMeta } from '../../types/pagination';

export interface BudgetMonthFilters {
  page: number;
  pageSize: number;
}

export interface BudgetMonthTotal {
  year: number;
  month: number;
  monthLabel: string;
  totalAmount: number;
}

export interface BudgetDetailRequest {
  year: number;
  month: number;
}

export interface BudgetRecord {
  id: number;
  budgetSetupId: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  date: string;
  amount: number;
  description: string;
  processed: boolean;
  note?: string | null;
  isRepeatle: boolean;
  repeatFrequency?: string | null;
}

export interface BudgetDetailState {
  loading: boolean;
  error: string | null;
  data: BudgetRecord[];
}

export interface BudgetState {
  loading: boolean;
  error: string | null;
  data: BudgetMonthTotal[];
  detailsByKey: Record<string, BudgetDetailState>;
  pagination: PaginationMeta;
}

export interface BudgetFormState {
  accountId: string;
  date: string;
  amount: string;
  description: string;
  processed: boolean;
  note: string;
}

export interface BudgetMutationPayload {
  accountId: number;
  date: string;
  amount: number;
  description: string;
  processed: boolean;
  note?: string;
}

export interface BudgetGeneratePayload {
  endDate: string;
  generateOnlyForFuture: boolean;
}

export interface BudgetFormDialogProps {
  open: boolean;
  editingBudget: BudgetRecord | null;
  form: BudgetFormState;
  formError: string | null;
  isSubmitting: boolean;
  accounts: Account[];
  isSetupLocked: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (field: keyof BudgetFormState, value: BudgetFormState[keyof BudgetFormState]) => void;
}

export interface BudgetGenerateDialogProps {
  open: boolean;
  endDate: string;
  generateOnlyForFuture: boolean;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onEndDateChange: (value: string) => void;
  onGenerateOnlyForFutureChange: (value: boolean) => void;
  onSubmit: () => void;
}

export const getBudgetDetailKey = ({ year, month }: BudgetDetailRequest): string =>
  `${year}-${month}`;