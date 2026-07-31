export interface VisualSessionInfo {
  sessionDir: string;
  screenDir: string;
  stateDir: string;
  url: string;
  host: string;
  port: number;
  pid: number;
  remote: boolean;
  forwardingRequired: boolean;
  localUrl: string;
  forwardingCommand?: string;
}

export interface VisualEvent {
  sessionId: string;
  screen: string;
  choice: string;
  timestamp: number;
}

export const MAX_SCREEN_BYTES = 512 * 1024;
export const MAX_EVENT_BYTES = 4 * 1024;
