import { CONTACT } from "@/lib/constants";

/**
 * The contact and support mailboxes are shared by every MRVIN100 product, so each message carries
 * the product name in its subject to let the team route it.
 */
export function productMailto(address: string, topic: string): string {
  const subject = `[${CONTACT.PRODUCT_REFERENCE}] ${topic}`;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}`;
}
