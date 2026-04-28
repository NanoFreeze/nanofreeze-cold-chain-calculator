import { setRequestLocale } from "next-intl/server";
import { CalculatorShell } from "@/components/wizard/CalculatorShell";
import type { Locale } from "@/i18n/routing";

/** The calculator. A server page whose only job is to pin the locale for the
 *  static render and hand off to the wizard, which is client top-to-bottom — it
 *  is one stateful tree and there is no server to split it against. */
export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <CalculatorShell />;
}
