import { /*PropsMap,*/ ItemMap, /*ConfigPropsObject,*/ ConfigObject, ConfigObjectTree /*PropsObject*/ } from "../Pelak";

/* --- Size Configuration ----------------------------------------------------------------------- */
export const SizeConfig = {
  Items: {
    sm: "h-028-6 px-012-3 has-[>svg]:px-008-2 [&_svg:not([class*='size-'])]:size-014-Z",
    md: "h-034-7 px-014-Z has-[>svg]:px-010-D [&_svg:not([class*='size-'])]:size-018-4",
    lg: "h-040-8 px-024-5 has-[>svg]:px-012-3 [&_svg:not([class*='size-'])]:size-024-5",
    smIcon: "p-002-T size-028-6",
    mdIcon: "p-002-T size-034-7",
    lgIcon: "p-002-T size-040-8",
    none: "",
  },
  Default: "md"
} as const satisfies ConfigObject<ItemMap>

/* --- Rounded Configuration -------------------------------------------------------------------- */
export const RoundedConfig = {
  Items: {
    xs: "rounded-xs",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
    none: "",
  },
  Default: "sm"
} as const satisfies ConfigObject<ItemMap>

/* --- Svg Size Configuration ------------------------------------------------------------ */
export const SvgSizeConfig = {
  Items: {
    xs: "size-012-3",
    sm: "size-018-4",
    md: "size-024-5",
    lg: "size-034-7",
    xl: "size-040-8",
    none: "",
  },
  Default: "sm"
} as const satisfies ConfigObject<ItemMap>

/* --- Svg Stroke Size Configuration ------------------------------------------------------------ */
export const SvgStrokeSizeConfig = {
  Base: 0.4,
  Items: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  Default: "md"
} as const satisfies ConfigObject<ItemMap>

/* --- Padding Configuration -------------------------------------------------------------------- */
export const PaddingConfig = {
  Items: {
    xs: "p-002-T",
    sm: "p-004-1",
    md: "p-008-2",
    lg: "p-012-3",
    xl: "p-018-4",
    none: ["", ""],
  },
  Default: "md"
} as const satisfies ConfigObject<ItemMap>

/* --- Gaps Configuration ----------------------------------------------------------------------- */
export const GapsConfig = {
  Items: {
    md: {
      xs: "gap-001-O",
      sm: "gap-002-T",
      md: "gap-004-1",
      lg: "gap-008-2",
      xl: "gap-012-3",
      none: ""
    },
    lg: {
      xs: "gap-002-T",
      sm: "gap-004-1",
      md: "gap-008-2",
      lg: "gap-016-H",
      xl: "gap-024-5",
      none: ""
    },
    xl: {
      xs: "gap-004-1",
      sm: "gap-008-2",
      md: "gap-012-3",
      lg: "gap-024-5",
      xl: "gap-034-7",
      none: ""
    }
  },
  Default: "md"
} as const satisfies ConfigObjectTree<ItemMap>