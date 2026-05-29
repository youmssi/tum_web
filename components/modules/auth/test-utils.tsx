import type { ReactNode } from "react";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import messages from "@/messages/en.json";

/**
 * RTL render wrapper that supplies the {@code NextIntlClientProvider} the auth forms (and any
 * other component using {@code useTranslations}) require at runtime. Tests can import this as a
 * drop-in for the bare {@code render} from {@code @testing-library/react}.
 */
export function renderWithIntl(ui: ReactNode, options?: RenderOptions) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
