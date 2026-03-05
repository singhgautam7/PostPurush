export interface KeyValuePair {
  key: string;
  value: string;
  enabled?: boolean;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BodyType = "json" | "raw" | "form";

export interface RequestBody {
  type: BodyType;
  content: string;
  formData: KeyValuePair[];
}

export interface SavedRequest {
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}
