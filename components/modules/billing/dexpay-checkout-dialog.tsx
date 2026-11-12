"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api-error";
import type { DexpayPlanPrice } from "./dexpay-api";
import { INTERNATIONAL_PHONE, formatDexpayPrice } from "./dexpay-price";
import { useStartDexpayCheckout } from "./use-dexpay";

interface DexpayCheckoutDialogProps {
  /** The option being bought; the dialog is open while this is set. */
  price: DexpayPlanPrice | null;
  defaultName?: string;
  defaultEmail?: string;
  onClose: () => void;
}

export function DexpayCheckoutDialog({
  price,
  defaultName,
  defaultEmail,
  onClose,
}: DexpayCheckoutDialogProps) {
  const t = useTranslations("billing.dexpay");
  const locale = useLocale();
  const startCheckout = useStartDexpayCheckout();

  const schema = z.object({
    name: z.string().trim().min(1, t("nameRequired")).max(120),
    email: z.string().trim().email(t("emailInvalid")),
    phone: z.string().trim().regex(INTERNATIONAL_PHONE, t("phoneInvalid")),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: { name: defaultName ?? "", email: defaultEmail ?? "", phone: "" },
  });

  async function onSubmit(values: Values) {
    if (!price) return;
    try {
      const { paymentUrl } = await startCheckout.mutateAsync({
        plan: price.plan,
        interval: price.interval,
        ...values,
      });
      window.location.assign(paymentUrl);
    } catch (error) {
      const forbidden = error instanceof ApiError && error.status === 403;
      form.setError("root", { message: forbidden ? t("ownerOnly") : t("failed") });
    }
  }

  const pending = form.formState.isSubmitting;

  return (
    <Dialog open={price !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {price &&
              t(price.interval === "YEARLY" ? "summaryYearly" : "summaryMonthly", {
                price: formatDexpayPrice(price, locale),
              })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dexpay-name">{t("nameLabel")}</FieldLabel>
                  <Input {...field} id="dexpay-name" autoComplete="name" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dexpay-email">{t("emailLabel")}</FieldLabel>
                  <Input {...field} id="dexpay-email" type="email" autoComplete="email" />
                  <FieldDescription>{t("emailHint")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
                    placeholder="+237650000000"
                  />
                  <FieldDescription>{t("phoneHint")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
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
