
/* --- Base ------------------------------------------------------------------------------------- */
import localFont from "next/font/local";
/* --- Constants -------------------------------------------------------------------------------- */
/* --- title Font --------------------------------------------------- */
export const titleFont = localFont({
  src: [
    {
      path: "../assets/fonts/title.woff2",
    },
    {
      path: "../assets/fonts/title.woff",
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
export const textFont = localFont({
  src: [
    {
      path: "../assets/fonts/text.woff2",
    },
    {
      path: "../assets/fonts/text.woff",
    }
  ],
  weight: "600",
  style: "normal",
  variable: "--font-text",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});