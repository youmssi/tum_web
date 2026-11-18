"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api-error";
import type { DexpayInterval, DexpayPlan } from "./dexpay-api";
import { INTERNATIONAL_PHONE, formatUsd } from "./dexpay-price";
import { useStartDexpayCheckout } from "./use-dexpay";

/** What the buyer picked on the pricing page, with the price shown there in US dollars. */
export interface DexpayCheckoutOption {
  plan: DexpayPlan;
  interval: DexpayInterval;
  usdAmount: number;
  /** True when the workspace already pays for the other plan. */
  change?: boolean;
}

interface DexpayCheckoutDialogProps {
  /** The option being bought; checkout starts as soon as this is set. */
  price: DexpayCheckoutOption | null;
  /** Billing contact, taken from the signed-in account; Dexpay pre-fills its page with it. */
  name: string;
  email: string;
  onClose: () => void;
}

const PHONE_REQUIRED = "phone_required";

/**
 * Sends the buyer straight to Dexpay, where they pay by mobile money. Dexpay needs a
 * phone number to create the workspace's customer, so the first payment of a workspace asks for
 * that one field; every later payment goes straight through.
 */
export function DexpayCheckoutDialog({ price, name, email, onClose }: DexpayCheckoutDialogProps) {
  const t = useTranslations("billing.dexpay");
  const locale = useLocale();
  const startCheckout = useStartDexpayCheckout();
  const [needsPhone, setNeedsPhone] = useState(false);
  const started = useRef<DexpayCheckoutOption | null>(null);

  const schema = z.object({
    phone: z.string().trim().regex(INTERNATIONAL_PHONE, t("phoneInvalid")),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { phone: "" } });

  function errorMessage(error: unknown) {
    const status = error instanceof ApiError ? error.status : undefined;
    if (status === 403) return t("ownerOnly");
    if (status === 409) return t("alreadyOnPlan");
    return t("failed");
  }

  useEffect(() => {
    if (!price || started.current === price) return;
    started.current = price;
    setNeedsPhone(false);
    startCheckout
      .mutateAsync({ plan: price.plan, interval: price.interval, name, email })
      .then(({ paymentUrl }) => window.location.assign(paymentUrl))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.problem.code === PHONE_REQUIRED) {
          setNeedsPhone(true);
          return;
        }
        toast.error(errorMessage(error));
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once per selected option
  }, [price]);

  async function onSubmit(values: Values) {
    if (!price) return;
    try {
      const { paymentUrl } = await startCheckout.mutateAsync({
        plan: price.plan,
        interval: price.interval,
        name,
        email,
        phone: values.phone,
      });
      window.location.assign(paymentUrl);
    } catch (error) {
      form.setError("root", { message: errorMessage(error) });
    }
  }

  function close() {
    started.current = null;
    setNeedsPhone(false);
    form.reset();
    onClose();
  }

  const pending = form.formState.isSubmitting;

  return (
    <Dialog open={price !== null && needsPhone} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {price &&
              t(price.interval === "YEARLY" ? "summaryYearly" : "summaryMonthly", {
                price: formatUsd(price.usdAmount, locale),
              })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dexpay-phone">{t("phoneLabel")}</FieldLabel>
                <Input
                  {...field}
                  id="dexpay-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+224621234567"
                  autoFocus
                />
                <FieldDescription>{t("phoneHint")}</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
