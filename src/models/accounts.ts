export interface Account {
  id: number;
  code: string;
  name: string;
  accountTypeId: number;
  currency?: string;
}

export interface AccountMutationPayload {
  code: string;
  name: string;
  accountTypeId: number;
  currency?: string;
}
