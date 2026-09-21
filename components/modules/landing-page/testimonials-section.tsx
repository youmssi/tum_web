"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

const IMAGES = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/women/52.jpg",
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/33.jpg",
];

function TestimonialCard({
  name,
  role,
  quote,
  image,
}: {
  name: string;
  role: string;
  quote: string;
  image: string;
}) {
  return (
    <Card className="w-[85vw] max-w-[340px] shrink-0 snap-start">
      <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
        <Avatar size="lg">
          <AvatarImage alt={name} src={image} loading="lazy" width={40} height={40} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm">{name}</h3>
          <span className="text-muted-foreground block text-xs tracking-wide">{role}</span>
          <div className="flex gap-0.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <StarIcon key={s} className="size-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="mt-2">
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{quote}</p>
          </blockquote>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const items = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        name: t(`items.${i}.name`),
        role: t(`items.${i}.role`),
        quote: t(`items.${i}.quote`),
        image: IMAGES[i],
      })),
    [t],
  );

  // Split into two rows for the mobile marquee
  const row1 = items.slice(0, 5);
  const row2 = items.slice(5, 9);

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 border-t border-foreground/8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div
          className={`text-center mb-14 lg:mb-20 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
            {t("heading")}
            <br />
            <span className="text-muted-foreground">{t("headingAccent")}</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{t("subhead")}</p>
        </div>

        {/* ─── Desktop: static 3-column masonry grid ─── */}
        <div
          className={`hidden lg:grid grid-cols-3 gap-4 transition-all duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {[0, 3, 6].map((start) => (
            <div key={start} className="space-y-4">
              {items.slice(start, start + 3).map((testimonial, i) => {
                const globalIndex = start + i;
                return (
                  <div
                    key={testimonial.name}
                    className={`transition-all duration-700 ${
                      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                    style={{ transitionDelay: `${globalIndex * 60}ms` }}
                  >
                    <Card>
                      <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                        <Avatar size="lg">
                          <AvatarImage
                            alt={testimonial.name}
                            src={testimonial.image}
                            loading="lazy"
                            width={40}
                            height={40}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{testimonial.name}</h3>
                          <span className="text-muted-foreground block text-sm tracking-wide">
                            {testimonial.role}
                          </span>
                          <div className="flex gap-0.5 mt-1.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <StarIcon
                                key={s}
                                className="size-3.5 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                          <blockquote className="mt-3">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {testimonial.quote}
                            </p>
                          </blockquote>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ─── Mobile: dual-row infinite horizontal marquee ─── */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* Row 1 — scrolls left */}
          <div
            className={`marquee-track ${visible ? "is-visible" : ""}`}
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            }}
          >
            <div className="marquee-content marquee-content-left">
              {[...row1, ...row1].map((testimonial, i) => (
                <TestimonialCard key={`${testimonial.name}-${i}`} {...testimonial} />
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div
            className={`marquee-track ${visible ? "is-visible" : ""}`}
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            }}
          >
            <div className="marquee-content marquee-content-right">
              {[...row2, ...row2].map((testimonial, i) => (
                <TestimonialCard key={`${testimonial.name}-${i}`} {...testimonial} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Marquee animation keyframes ─── */}
      <style>{`
        .marquee-track {
          overflow: hidden;
          width: 100%;
          padding: 4px 0;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .marquee-track.is-visible {
          opacity: 1;
        }

        .marquee-content {
          display: flex;
          gap: 1rem;
          width: fit-content;
        }

        /* Animation only when the track is visible, and only when user hasn't
           requested reduced motion. Uses parent selector so the animation starts
           clean from its initial keyframe on first appearance. */
        @media (prefers-reduced-motion: no-preference) {
          .marquee-track.is-visible .marquee-content-left {
            animation: scroll-left 40s linear infinite;
          }
          .marquee-track.is-visible .marquee-content-right {
            animation: scroll-right 40s linear infinite;
          }

          /* Pause on hover for accessibility */
          .marquee-track.is-visible:hover .marquee-content-left,
          .marquee-track.is-visible:hover .marquee-content-right {
            animation-play-state: paused;
          }
        }

        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
