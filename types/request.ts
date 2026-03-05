export interface KeyValuePair {
  key: string;
  value: string;
  enabled?: boolean;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BodyType = "json" | "raw";

export interface RequestBody {
  type: BodyType;
  content: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  createdAt: number;
  updatedAt: number;
}
