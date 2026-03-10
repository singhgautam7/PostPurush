export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
  type?: "string" | "number" | "boolean" | "float";
  required?: boolean;
  deprecated?: boolean;
  sensitive?: boolean;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  variables: EnvVariable[];
  createdAt: number;
  updatedAt: number;
}

/** @deprecated Use EnvVariable instead — kept for DB migration only */
export interface EnvironmentVariable {
  key: string;
  value: string;
}
