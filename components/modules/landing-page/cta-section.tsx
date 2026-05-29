"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CtaSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 border-t border-foreground/8">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-foreground/15 rounded-3xl overflow-hidden p-12 lg:p-20 transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Background radial */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
              Your projects.
              <br />
              Finally under control.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Tûm brings tasks, timelines, and team visibility into one coherent workspace. Pick it
              up today — personally, with your team, or across your whole community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="h-12 px-8 rounded-full group" asChild>
                <Link href={ROUTES.SIGNUP}>
                  Get started free
                  <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full" asChild>
                <Link href={ROUTES.LOGIN}>Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-foreground/8 rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-t border-r border-foreground/8 rounded-tr-3xl" />
        </div>
      </div>
    </section>
  );
}
