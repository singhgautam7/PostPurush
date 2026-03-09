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
}
