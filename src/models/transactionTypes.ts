export interface TransactionType {
  id: number;
  code: string;
  name: string;
}

export interface TransactionTypeMutationPayload {
  code: string;
  name: string;
}
