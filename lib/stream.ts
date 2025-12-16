export interface OrderItem {
  menuItem: string;
  quantity: number;
  price?: number;
  status?: string;
  startedAt?: string | null;
  readyAt?: string | null;
}

export interface OrderData {
  id: string;
  orderNumber?: string; // ✅ added
  menuItem?: string;
  quantity?: number;
  status: string;
  startedAt?: string | null;
  readyAt?: string | null;
  items?: OrderItem[];
  order?: {
    id: string;
    orderNumber?: string; // ✅ added
    table?: string | null;
    customer: string;
    total?: number;
    priority?: string | null;
    estimatedTime?: number | null;
    specialInstructions?: string | null;
  };
}

export function fetchKOTsSSE(onData: (data: OrderData[]) => void): EventSource {
  const es = new EventSource("/api/kot/stream");

  es.onmessage = (event: MessageEvent) => {
    try {
      const parsed: OrderData[] = JSON.parse(event.data);
      onData(parsed);
    } catch (err) {
      console.error("SSE parsing error:", err);
    }
  };

  es.onerror = (err) => {
    console.error("SSE connection error:", err);
    es.close();
  };

  return es;
}

export function fetchOrdersSSE(onData: (data: OrderData[]) => void): EventSource {
  const es = new EventSource("/api/orders/stream");

  es.onmessage = (event: MessageEvent) => {
    try {
      const parsed: OrderData[] = JSON.parse(event.data);
      onData(parsed);
    } catch (err) {
      console.error("SSE parsing error:", err);
    }
  };

  es.onerror = (err) => {
    console.error("SSE connection error:", err);
    es.close();
  };

  return es;
}
