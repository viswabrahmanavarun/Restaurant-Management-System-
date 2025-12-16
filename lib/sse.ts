// lib/sse.ts

// Stores all connected SSE clients
let clients: {
  id: number;
  send: (msg: string) => void;
}[] = [];

let clientId = 0;

/**
 * Register a new SSE client
 */
export function addClient(send: (msg: string) => void) {
  const id = ++clientId;
  clients.push({ id, send });
  console.log("🟢 Client added:", id);
  return id;
}

/**
 * Remove a disconnected SSE client
 */
export function removeClient(id: number) {
  clients = clients.filter((c) => c.id !== id);
  console.log("🔴 Client removed:", id);
}

/**
 * Broadcast event to ALL connected SSE clients
 */
export function sendEvent(payload: any) {
  const msg = `data: ${JSON.stringify(payload)}\n\n`;

  clients.forEach((client) => {
    try {
      client.send(msg);
    } catch (err) {
      console.error("❌ SSE send error:", err);
    }
  });
}

/**
 * BACKWARD COMPATIBILITY
 * Older code uses broadcastOrder() and broadcastKOT()
 * These functions now simply call sendEvent()
 */
export const broadcastOrder = (data: any) =>
  sendEvent({ type: "ORDER_EVENT", ...data });

export const broadcastKOT = (data: any) =>
  sendEvent({ type: "KOT_EVENT", ...data });
