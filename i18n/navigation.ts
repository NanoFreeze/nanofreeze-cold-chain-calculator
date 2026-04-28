import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / redirect / usePathname / useRouter / getPathname. Use
// these instead of next/link for internal navigation so the current locale is
// preserved on click.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
