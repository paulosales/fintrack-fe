export interface AccountType {
  id: number;
  code: string;
  name: string;
}

export interface AccountTypeMutationPayload {
  code: string;
  name: string;
}
