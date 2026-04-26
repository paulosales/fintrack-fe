export interface Setting {
  id: number;
  code: string;
  description: string;
  value: string | null;
}

export interface SettingMutationPayload {
  code: string;
  description: string;
  value: string | null;
}
