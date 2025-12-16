// app/api/kot/stream/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

let clients: any[] = [];

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      clients.push({ send });

      const interval = setInterval(() => {
        send({ ping: true });
      }, 20000);

      const close = () => {
        clearInterval(interval);
        clients = clients.filter((c) => c.send !== send);
        controller.close();
      };

      (globalThis as any).onClose = close;
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// call this to broadcast from anywhere
export function broadcastEvent(data: any) {
  clients.forEach((client) => client.send(data));
}
