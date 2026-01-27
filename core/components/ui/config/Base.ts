import { ItemMap, ConfigObject } from "../Pelak";

/* --- Flex Configuration ----------------------------------------------------------------------- */
export const BaseFlexConfig = {
  Base: "flex",
  Items: {
    col: "flex-col",
    row: "flex-row",
    warp: "flex-warp",
    colrev: "flex-col-reverse",
    rowrev: "flex-row-reverse",
    warprev: "flex-warp-reverse",
    none: "",
  },
  Default: "col"
} as const satisfies ConfigObject<ItemMap>