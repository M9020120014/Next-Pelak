
/* --- Base ------------------------------------------------------------------------------------- */
import localFont from "next/font/local";
/* --- Constants -------------------------------------------------------------------------------- */
/* --- title Font --------------------------------------------------- */
const ltrTitleFont = localFont({
  src: [
    {
      path: "../asset/fonts/ltr-title.woff2",
    },
    {
      path: "../asset/fonts/ltr-title.woff",
    }
  ],
  weight: "900",
  style: "normal",
  variable: "--font-title",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});
const ltrTextFont = localFont({
  src: [
    {
      path: "../asset/fonts/ltr-text.woff2",
    },
    {
      path: "../asset/fonts/ltr-text.woff",
    }
  ],
  weight: "600",
  style: "normal",
  variable: "--font-text",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
const rtlTitleFont = localFont({
  src: [
    {
      path: "../asset/fonts/rtl-title.woff2",
    },
    {
      path: "../asset/fonts/rtl-title.woff",
    }
  ],
  weight: "900",
  style: "normal",
  variable: "--font-title",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});
const rtlTextFont = localFont({
  src: [
    {
      path: "../asset/fonts/rtl-text.woff2",
    },
    {
      path: "../asset/fonts/rtl-text.woff",
    }
  ],
  weight: "600",
  style: "normal",
  variable: "--font-text",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const Font = {
  rtl: {
    title: rtlTitleFont,
    text: rtlTextFont,
  },
  ltr: {
    title: ltrTitleFont,
    text: ltrTextFont,
  }
} as const 