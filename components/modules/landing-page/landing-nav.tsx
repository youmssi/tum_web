"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { TumLogo } from "./tum-logo";

export function LandingNav() {
  const t = useTranslations("landing.nav");
  const navLinks = [
    { key: "features", name: t("features"), href: "#features" },
    { key: "howItWorks", name: t("howItWorks"), href: "#how-it-works" },
    { key: "pricing", name: t("pricing"), href: "#pricing" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-3 left-3 right-3" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || mobileOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-5xl"
            : "bg-transparent max-w-6xl"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 lg:px-8 transition-all duration-500 ${
            isScrolled ? "h-14" : "h-18"
          }`}
        >
          <a href="#" className="flex items-center gap-2">
            <TumLogo
              className={`transition-all duration-500 ${isScrolled ? "size-7" : "size-8"}`}
            />
            <span
              className={`font-bold tracking-tight transition-all duration-500 ${isScrolled ? "text-lg" : "text-xl"}`}
            >
              Tûm
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.LOGIN}>{t("signIn")}</Link>
            </Button>
            <Button size="sm" className="rounded-full px-5" asChild>
              <Link href={ROUTES.SIGNUP}>{t("getStarted")}</Link>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full px-8 pt-24 pb-8">
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-4xl font-bold text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex gap-3 pt-8 border-t border-foreground/10">
            <Button variant="outline" className="flex-1 h-12 rounded-full" asChild>
              <Link href={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                {t("signIn")}
              </Link>
            </Button>
            <Button className="flex-1 h-12 rounded-full" asChild>
              <Link href={ROUTES.SIGNUP} onClick={() => setMobileOpen(false)}>
                {t("getStarted")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
