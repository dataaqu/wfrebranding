"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconHome, IconMail, IconNews, IconPackage, IconTruckDelivery, IconUsers } from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { NAV } from "./Header";

/* Site dock (Aceternity Floating Dock) on every page: Home plus the header's links, each with its icon
   (the link to the page you are on is left out). Hidden at the top of the page; on the first scroll it springs up from the bottom, and it leaves again back at the top.
   Bottom centre on desktop; bottom left on phones (the quick-contact button owns bottom right).
   The dock keeps the Aceternity source's shapes and motion 1:1, in brandbook colours (see floating-dock.tsx). */

const ICON = "h-full w-full text-white";
const ICONS: Record<string, React.ReactNode> = {
  "/about": <IconUsers className={ICON} />,
  "/services": <IconPackage className={ICON} />,
  "/track": <IconTruckDelivery className={ICON} />,
  "/blog": <IconNews className={ICON} />,
  "/contact": <IconMail className={ICON} />,
};
// Home, then the header nav in its order (top level only), without FAQ
const LINKS = [
  { title: "Home", href: "/", icon: <IconHome className={ICON} /> },
  ...NAV.filter(({ href }) => ICONS[href]).map(({ label, href }) => ({ title: label, href, icon: ICONS[href] })),
];

export default function HomeDock() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const items = LINKS.filter((l) => l.href !== pathname); // the page you are on is left out
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-start px-4 md:bottom-6 md:justify-center">
      <AnimatePresence>
        {shown && (
          <motion.nav
            aria-label="Page sections"
            className="pointer-events-auto"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 80, scale: 0.92 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 24 }}
          >
            <FloatingDock items={items} />
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
