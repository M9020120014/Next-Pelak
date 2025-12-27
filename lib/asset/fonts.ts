
/* --- Base ------------------------------------------------------------------------------------- */
import localFont from "next/font/local";
/* --- Constants -------------------------------------------------------------------------------- */
/* --- title Font --------------------------------------------------- */
export const defaultTitleFont = localFont({
  src: [
    {
      path: "../../asset/fonts/default-title.woff2",
    },
    {
      path: "../../asset/fonts/default-title.woff",
    }
  ],
  weight: "900",
  style: "normal",
  variable: "--font-title",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});
/* --- text Font ---------------------------------------------------- */
export const defaultTextFont = localFont({
  src: [
    {
      path: "../../asset/fonts/default-text.woff2",
    },
    {
      path: "../../asset/fonts/default-text.woff",
    }
  ],
  weight: "600",
  style: "normal",
  variable: "--font-text",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});