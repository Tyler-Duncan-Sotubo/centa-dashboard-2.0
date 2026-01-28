/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { essMain } from "../config/mobile-sidebar.data";

const isDivider = (m: any) => (m as any)?.type === "divider";

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // ✅ default open the section that contains the active route
  const defaultOpen = React.useMemo(() => {
    const match = essMain
      .filter((m: any) => !isDivider(m))
      .find((item: any) =>
        (item.subItems ?? []).some((sub: any) =>
          isLinkOrDescendant(pathname, sub.link),
        ),
      );

    return match?.title ? [String(match.title)] : [];
  }, [pathname]);

  return (
    <div className="md:hidden p-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className="p-2 focus:outline-hidden"
            type="button"
          >
            <Menu className="h-8 w-8 text-monzo-brand" />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-2/3 bg-white">
          <SheetTitle className="sr-only">ESS Navigation</SheetTitle>

          <div className="p-4 border-b">
            <div className="font-semibold">Menu</div>
            <div className="text-xs text-muted-foreground">
              Navigate self-service
            </div>
          </div>

          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <Accordion
              type="multiple"
              defaultValue={defaultOpen}
              className="p-2"
            >
              {essMain.map((item: any, idx: number) => {
                // ✅ Dividers / section headings if you add them later
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

                const title = String(item.title ?? "");
                const icon = item.icon;
                const hasSub = Boolean(item.subItems?.length);

                // ✅ No children → plain link row
                if (!hasSub && item.link) {
                  const active = isLinkOrDescendant(pathname, item.link);

                  return (
                    <div key={title} className="px-2 py-1">
                      <Link
                        href={item.link}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                          "hover:bg-muted/60",
                          active
                            ? "font-semibold text-primary"
                            : "font-medium text-monzo-background",
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          {icon ? (
                            <span className="text-base shrink-0">{icon}</span>
                          ) : null}
                          <span className="truncate">{title}</span>
                        </span>
                      </Link>
                    </div>
                  );
                }

                // ✅ Has children → accordion section
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
                            : "font-medium text-monzo-background",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {icon ? (
                            <span className="text-base shrink-0">{icon}</span>
                          ) : null}
                          <span className="truncate">{title}</span>
                        </div>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent className="pt-1 pb-2">
                      <div className="space-y-1 px-2">
                        {(item.subItems ?? []).map((sub: any) => {
                          const active = isLinkOrDescendant(pathname, sub.link);

                          return (
                            <Link
                              key={sub.link}
                              href={sub.link}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                                "hover:bg-muted/60",
                                active
                                  ? "font-semibold text-primary"
                                  : "font-normal text-monzo-background",
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

            {/* Logout */}
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
    </div>
  );
}
