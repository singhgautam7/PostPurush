export interface ApiResponse {
    status: number;
    statusText: string;
    time: number;
    size: number;
    headers: Record<string, string>;
    body: string;
    raw: string;
    error?: string;
}
