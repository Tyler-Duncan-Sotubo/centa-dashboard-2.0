/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiMoreHorizontal } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

const isDivider = (m: any) => (m as any)?.type === "divider";
const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

export function MobileMoreNav({ menu }: { menu: any[] }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  // default open the section that contains the active route
  const defaultOpen = React.useMemo(() => {
    const match = menu
      .filter((m: any) => !isDivider(m))
      .find((item: any) =>
        (item.subItems ?? []).some((sub: any) =>
          isLinkOrDescendant(pathname, sub.link),
        ),
      );

    return match?.title ? [String(match.title)] : [];
  }, [menu, pathname]);

  return (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 text-[10px]",
            "text-muted-foreground font-semibold",
          )}
        >
          <FiMoreHorizontal className="h-6 w-6 border p-1 rounded-full" />
          <span className="leading-none">More</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-[86vw] sm:w-105">
        <div className="p-4 border-b">
          <div className="font-semibold">More</div>
          <div className="text-xs text-muted-foreground">All sections</div>
        </div>

        <SheetTitle className="sr-only">More Navigation</SheetTitle>

        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <Accordion type="multiple" defaultValue={defaultOpen} className="p-2">
            {menu.map((item: any, idx: number) => {
              // dividers / section headers
              if (isDivider(item)) {
                const label = String(item.name ?? item.title ?? "");
                return (
                  <div
                    key={`divider-${label}-${idx}`}
                    className="px-4 pt-4 pb-2"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {label}
                    </div>
                  </div>
                );
              }

              const hasSub = Boolean(item.subItems?.length);
              const title = String(item.title ?? "");
              const icon = item.icon;

              // no children
              if (!hasSub && item.link) {
                const active = isLinkOrDescendant(pathname, item.link);

                return (
                  <div key={title} className="px-2 py-1">
                    <Link
                      href={item.link}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                        "hover:bg-muted/60",
                        active ? "font-semibold text-primary" : "font-medium",
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {icon ? (
                          <span className="text-base shrink-0">{icon}</span>
                        ) : null}
                        <span className="truncate">{title}</span>
                      </span>
                    </Link>
                  </div>
                );
              }

              // has children
              const parentActive = (item.subItems ?? []).some((sub: any) =>
                isLinkOrDescendant(pathname, sub.link),
              );

              return (
                <AccordionItem key={title} value={title} className="border-0">
                  <div className="px-2">
                    <AccordionTrigger
                      className={cn(
                        "rounded-md px-3 py-2 text-sm hover:no-underline hover:bg-muted/60",
                        parentActive
                          ? "font-semibold text-primary"
                          : "font-medium",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {icon ? (
                          <span className="text-base shrink-0">{icon}</span>
                        ) : null}
                        <span className="truncate">{title}</span>
                      </div>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="pt-1 pb-2">
                    <div className="space-y-1 px-2">
                      {(item.subItems ?? [])
                        // if you later add sub-item section headings, keep this line:
                        .filter((s: any) => !s.name)
                        .map((sub: any) => {
                          const active = isLinkOrDescendant(pathname, sub.link);

                          return (
                            <Link
                              key={sub.link}
                              href={sub.link}
                              onClick={() => setMoreOpen(false)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                                "hover:bg-muted/60",
                                active
                                  ? "font-semibold text-primary"
                                  : "font-normal",
                              )}
                            >
                              <span className="truncate">{sub.title}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="p-2 mt-2 border-t">
            <button
              onClick={() => signOut()}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                "text-monzo-error hover:bg-muted/60",
              )}
            >
              <MdLogout size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
