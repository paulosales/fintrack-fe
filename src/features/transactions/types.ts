import type { Account } from '../../models/accounts';
import type { Category } from '../../models/categories';
import type { TransactionType } from '../../models/transactionTypes';
import type { PaginationMeta } from '../../types/pagination';

export interface TransactionFilters {
  accountId: number | null;
  transactionTypeId: number | null;
  categoryId: number | null;
  description: string;
  descriptionInput?: string;
  page: number;
  pageSize: number;
}

export interface TransactionFilterOptions {
  accounts: Account[];
  transactionTypes: TransactionType[];
  categories: Category[];
}

export interface TransactionFilterLoadingState {
  accounts: boolean;
  transactionTypes: boolean;
  categories: boolean;
  transactions: boolean;
}

export interface TransactionFilterActions {
  onAccountChange: (accountId: number | null) => void;
  onTransactionTypeChange: (transactionTypeId: number | null) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onDescriptionChange: (description: string) => void;
  onReload: () => void;
}

export interface TransactionFiltersProps {
  filters: TransactionFilters;
  options: TransactionFilterOptions;
  loadingState: TransactionFilterLoadingState;
  actions: TransactionFilterActions;
}

export interface Transaction {
  id: number;
  accountId: number;
  transactionTypeId: number;
  categoryIds?: string;
  transactionTypeName?: string;
  categories?: string;
  datetime: string;
  amount: number;
  description: string;
  note?: string;
  fingerprint: string;
}

export interface TransactionMutationPayload {
  accountId: number;
  transactionTypeId: number;
  categoryIds: number[];
  datetime: string;
  amount: number;
  description: string;
  note?: string;
}

export interface TransactionFormState {
  accountId: string;
  transactionTypeId: string;
  categoryIds: string[];
  datetime: string;
  amount: string;
  description: string;
  note: string;
}

export interface TransactionFormDialogProps {
  open: boolean;
  editingTransaction: Transaction | null;
  initialValues: TransactionFormState;
  formError: string | null;
  isSubmitting: boolean;
  accounts: Account[];
  transactionTypes: TransactionType[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (values: TransactionFormState) => void;
}

export interface TransactionState {
  loading: boolean;
  error: string | null;
  data: Transaction[];
  detailsByTransactionId: Record<number, TransactionDetailsState>;
  pagination: PaginationMeta;
}

export interface SubTransaction {
  id: number;
  transactionId: number;
  productCode?: string | null;
  amount: number;
  description: string;
  note?: string | null;
}

export interface TransactionDetailsState {
  loading: boolean;
  error: string | null;
  data: SubTransaction[];
}
