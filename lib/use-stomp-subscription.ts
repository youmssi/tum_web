"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { IMessage } from "@stomp/stompjs";

import { stompManager } from "./stomp-client";
import { env } from "./env";

export function useStompSubscription(topic: string | null, onMessage: (msg: IMessage) => void) {
  const callbackRef = useRef(onMessage);
  useLayoutEffect(() => {
    callbackRef.current = onMessage;
  });

  useEffect(() => {
    if (!topic) return;

    let teardown: (() => void) | null = null;
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch(`${env.betterAuthUrl}/api/auth/token`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { token?: string };
        if (!data.token || cancelled) return;

        stompManager.connect(data.token);
        teardown = stompManager.subscribe(topic, (msg) => callbackRef.current(msg));
      } catch {
        // STOMP not available (test/SSR)
      }
    };

    init();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [topic]);
}
