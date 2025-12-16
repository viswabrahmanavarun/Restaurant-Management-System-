// app/api/orders/stream/route.ts
import { addClient, removeClient } from "@/lib/sse";
import prisma from "@/lib/prisma";

const encoder = new TextEncoder();

export async function GET(req: Request) {
  let interval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: string) => {
        try {
          controller.enqueue(encoder.encode(msg));
        } catch (err) {
          console.error("❌ SSE enqueue error:", err);
        }
      };

      // 1️⃣ REGISTER SSE CLIENT
      const clientId = addClient(send);
      console.log("🟢 SSE Client Connected ID:", clientId);

      // 2️⃣ FETCH INITIAL ORDERS — ALWAYS SEND AS { type: 'ORDERS', orders: [...] }
      prisma.order
        .findMany({
          include: { items: true },
          orderBy: { createdAt: "desc" },
        })
        .then((orders) => {
          send(
            `data: ${JSON.stringify({
              type: "ORDERS",
              orders,
            })}\n\n`
          );
        })
        .catch((err) => console.error("❌ Initial SSE fetch error:", err));

      // 3️⃣ HEARTBEAT EVERY 15s
      interval = setInterval(() => {
        send(": ping\n\n");
      }, 15000);

      // 4️⃣ CLEANUP ON DISCONNECT
      req.signal.addEventListener("abort", () => {
        console.log("🔴 SSE Client Disconnected ID:", clientId);

        if (interval) clearInterval(interval);
        removeClient(clientId);

        try {
          controller.close();
        } catch {}
      });
    },

    cancel() {
      if (interval) clearInterval(interval);
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
