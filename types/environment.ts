export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  variables: EnvVariable[];
  createdAt: number;
  updatedAt: number;
}

/** @deprecated Use EnvVariable instead — kept for DB migration only */
export interface EnvironmentVariable {
  key: string;
  value: string;
}
