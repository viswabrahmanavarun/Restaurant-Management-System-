// app/api/sse/route.ts
import { NextResponse } from "next/server";

/**
 * Global SSE Client Store
 */
if (!(globalThis as any).__SSE_CLIENTS) {
  (globalThis as any).__SSE_CLIENTS = new Set();
}
const clients: Set<any> = (globalThis as any).__SSE_CLIENTS;

/**
 * 🔥 BROADCAST FUNCTION — CALL THIS FROM ANY API ROUTE
 */
export function broadcastEvent(data: any) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  for (const client of clients) {
    try {
      client.controller.enqueue(encoder.encode(payload));
    } catch (e) {
      // Remove broken clients
      clients.delete(client);
    }
  }
}

/**
 * SSE CONNECTION HANDLER
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const id = Math.random().toString(36).substring(2);

      const client = { id, controller };
      clients.add(client);

      // Confirm connected
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "SSE_CONNECTED",
            payload: { id },
          })}\n\n`
        )
      );

      // Keep-alive ping every 20sec
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {}
      }, 20000);

      // On close → cleanup
      (controller as any).onclose = () => {
        clearInterval(keepAlive);
        clients.delete(client);
      };
    },

    cancel() {
      // Cleanup closed streams
      for (const c of clients) {
        try {
          if (c.controller?.closed) clients.delete(c);
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
