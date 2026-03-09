export interface RequestSnapshot {
  url: string;
  resolvedUrl: string;
  method: string;
  params: { key: string; value: string }[];
  headers: { key: string; value: string }[];
  bodyType: "none" | "json" | "form" | "raw";
  bodyContent: string;
  formData?: { key: string; value: string }[];
}

export interface ResponseMetadata {
  id: string;
  requestName: string;
  method: string;
  resolvedUrl: string;
  statusCode: number;
  statusText: string;
  durationMs: number;
  responseSizeBytes: number;
  contentType: string;
  startTime: number;
  endTime: number;
  envId: string | null;
  envName: string | null;
  requestSnapshot?: RequestSnapshot;
}
