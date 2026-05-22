import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

import { env } from "./env";

type SubscriberEntry = {
  topic: string;
  callback: (msg: IMessage) => void;
  sub: StompSubscription | null;
};

class StompManager {
  private client: Client | null = null;
  private entries = new Map<symbol, SubscriberEntry>();

  connect(token: string) {
    if (this.client) return;

    this.client = new Client({
      brokerURL: env.wsBaseUrl.replace(/^https?/, "ws") + "/ws",
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5_000,
    });

    this.client.onConnect = () => {
      for (const entry of this.entries.values()) {
        if (!entry.sub) {
          entry.sub = this.client!.subscribe(entry.topic, entry.callback);
        }
      }
    };

    this.client.activate();
  }

  subscribe(topic: string, callback: (msg: IMessage) => void): () => void {
    const key = Symbol();
    const entry: SubscriberEntry = { topic, callback, sub: null };
    this.entries.set(key, entry);

    if (this.client?.connected) {
      entry.sub = this.client.subscribe(topic, callback);
    }

    return () => {
      entry.sub?.unsubscribe();
      this.entries.delete(key);
    };
  }

  reset() {
    this.client?.deactivate();
    this.client = null;
    this.entries.clear();
  }
}

export const stompManager = new StompManager();
