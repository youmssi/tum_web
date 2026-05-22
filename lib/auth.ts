import "server-only";

import { auth } from "@/auth.config";

export { auth };
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
