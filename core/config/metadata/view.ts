import { Viewport } from "next";

import { SITE_DATA_BASE} from "@/core/config/site";

export const SITE_VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: SITE_DATA_BASE.Theme.light,
};