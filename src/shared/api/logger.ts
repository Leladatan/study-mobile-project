export type HttpOutcome =
  | 'success'
  | 'http_error'
  | 'not_found'
  | 'network_error'
  | 'timeout'
  | 'cancel'
  | 'parse_error';

export type HttpStartEvent = {
  event: 'http.start';
  timestamp: string;
  requestId: string;
  method: string;
  route: string;
};

export type HttpEndEvent = {
  event: 'http.end';
  timestamp: string;
  requestId: string;
  method: string;
  route: string;
  status: number | null;
  durationMs: number;
  outcome: HttpOutcome;
};

export type ContractErrorEvent = {
  event: 'api.contract_error';
  timestamp: string;
  requestId: string;
  route: string;
  field: string;
};

export type LogEvent = HttpStartEvent | HttpEndEvent | ContractErrorEvent;

const enabled = typeof __DEV__ !== 'undefined' && __DEV__;

let counter = 0;

export function createRequestId(): string {
  counter += 1;
  return `req-${counter}`;
}

export function safeRoute(path: string): string {
  return path.split('?')[0];
}

function write(event: LogEvent): void {
  if (!enabled) return;
  console.info(JSON.stringify(event));
}

export const logger = {
  httpStart(data: Omit<HttpStartEvent, 'event' | 'timestamp'>): void {
    write({ event: 'http.start', timestamp: new Date().toISOString(), ...data });
  },

  httpEnd(data: Omit<HttpEndEvent, 'event' | 'timestamp'>): void {
    write({ event: 'http.end', timestamp: new Date().toISOString(), ...data });
  },

  contractError(data: Omit<ContractErrorEvent, 'event' | 'timestamp'>): void {
    write({ event: 'api.contract_error', timestamp: new Date().toISOString(), ...data });
  },
};
