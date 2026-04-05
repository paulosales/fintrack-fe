import type { Account } from '../../models/accounts';
import type { PaginationMeta } from '../../types/pagination';

export interface BudgetSetupRecord {
  id: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  date: string;
  isRepeatle: boolean;
  repeatFrequency?: string | null;
  endDate?: string | null;
  description: string;
  amount: number;
  note?: string | null;
}

export interface BudgetSetupState {
  loading: boolean;
  error: string | null;
  data: BudgetSetupRecord[];
  pagination: PaginationMeta;
}

export interface BudgetSetupFilters {
  page: number;
  pageSize: number;
}

export interface BudgetSetupFormState {
  accountId: string;
  date: string;
  isRepeatle: boolean;
  repeatFrequency: string;
  endDate: string;
  description: string;
  amount: string;
  note: string;
}

export interface BudgetSetupMutationPayload {
  accountId: number;
  date: string;
  isRepeatle: boolean;
  repeatFrequency?: string;
  endDate?: string;
  description: string;
  amount: number;
  note?: string;
}

export interface BudgetSetupFormDialogProps {
  open: boolean;
  editingBudgetSetup: BudgetSetupRecord | null;
  initialValues: BudgetSetupFormState;
  formError: string | null;
  isSubmitting: boolean;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (values: BudgetSetupFormState) => void;
}

export const repeatFrequencyOptions = ['MONTHLY', 'WEEKLY', 'YEARLY', 'BIWEEKLY'] as const;
