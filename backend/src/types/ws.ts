import type { ServerWebSocket } from "bun";

export type WSData = {
  id: string;
};

export type Client = {
  id: string;
  ws: ServerWebSocket<WSData>;
};
