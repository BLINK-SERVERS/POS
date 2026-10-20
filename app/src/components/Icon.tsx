// Iconos SVG originales (línea, 24×24). Sin emoji.
import { memo, type ReactElement, type SVGProps } from "react";

export type IconName =
  | "home"
  | "cart"
  | "tag"
  | "box"
  | "users"
  | "wallet"
  | "chart"
  | "settings"
  | "logout"
  | "plus"
  | "minus"
  | "check"
  | "close"
  | "search"
  | "store"
  | "cash"
  | "alert"
  | "trash"
  | "arrowRight"
  | "receipt"
  | "printer"
  | "menu"
  | "mail"
  | "lock"
  | "scan"
  | "phone"
  | "download"
  | "fileText"
  | "table"
  | "calendar"
  | "filter"
  | "share";

const P: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17.5" cy="19.5" r="1.4" />
      <path d="M2.5 3.5h2.3l2.1 11h11.3l1.9-7.8H6.2" />
    </>
  ),
  tag: (
    <>
      <path d="M12.6 3H20a1 1 0 0 1 1 1v7.4a1 1 0 0 1-.3.7l-8.6 8.6a1 1 0 0 1-1.4 0l-7.4-7.4a1 1 0 0 1 0-1.4L11.9 3.3a1 1 0 0 1 .7-.3Z" />
      <circle cx="16.4" cy="7.6" r="1.4" />
    </>
  ),
  box: (
    <>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M17.6 14.1c2 .7 3.4 2.5 3.4 4.7" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18" />
      <circle cx="16.6" cy="13.6" r="1.2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 20v-6" />
      <path d="M13 20V8" />
      <path d="M18 20v-9" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.6v2.3M12 19.1v2.3M4.5 4.5l1.6 1.6M17.9 17.9l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.5 19.5l1.6-1.6M17.9 6.1l1.6-1.6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3" />
      <path d="m6 9-3 3 3 3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 13 4 4 10-11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  store: (
    <>
      <path d="M3 9 5 4h14l2 5" />
      <path d="M4 9v11h16V9" />
      <path d="M9.5 20v-5.5h5V20" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6 9v6M18 9v6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.6 20h18.8z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17.3" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3v18l3-1.8 3 1.8 3-1.8 3 1.8V3z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V4h12v5" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
      <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5" />
      <path d="M15.5 4H18a2 2 0 0 1 2 2v2.5" />
      <path d="M20 15.5V18a2 2 0 0 1-2 2h-2.5" />
      <path d="M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
      <path d="M3.5 12h17" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
      <path d="M10.5 18.6h3" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  fileText: (
    <>
      <path d="M6 2.8h7.5L18 7.3v13.9H6z" />
      <path d="M13.2 2.8v4.7H18" />
      <path d="M9 12h6M9 15.5h6" />
    </>
  ),
  table: (
    <>
      <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2" />
      <path d="M3.2 9.4h17.6M9.4 9.4v10.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  filter: (
    <>
      <path d="M3.5 5h17l-6.6 7.6V19l-3.8 2v-8.4z" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="17.5" cy="5.5" r="2.6" />
      <circle cx="17.5" cy="18.5" r="2.6" />
      <path d="m8.3 10.7 6.9-3.9M8.3 13.3l6.9 3.9" />
    </>
  ),
};
export const Icon = memo(function Icon({
  name,
  size = "md",
  ...rest
}: { name: IconName; size?: "sm" | "md" | "lg" | "xl" } & SVGProps<SVGSVGElement>) {
  const cls = size === "md" ? "icon" : `icon icon--${size}`;
  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {P[name]}
    </svg>
  );
});
