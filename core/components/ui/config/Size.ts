import { /*PropsMap,*/ ItemMap, /*ConfigPropsObject,*/ ConfigObject, ConfigObjectTree /*PropsObject*/ } from "../Pelak";

/* --- Rounded Configuration -------------------------------------------------------------------- */
export const SizeRoundedConfig = {
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

/* --- Size Svg Configuration ------------------------------------------------------------ */
export const SizeBorderConfig = {
  Items: {
    all: {
      zero: "border-0",
      sm: "border-1",
      md: "border-2",
      lg: "border-3",
      xl: "border-4",
      none: ""
    },
    top: {
      zero: "border-t-0",
      sm: "border-t-1",
      md: "border-t-2",
      lg: "border-t-3",
      xl: "border-t-4",
      none: ""
    },
    bottom: {
      zero: "border-b-0",
      sm: "border-b-1",
      md: "border-b-2",
      lg: "border-b-3",
      xl: "border-b-4",
      none: ""
    },
    start: {
      zero: "border-s-0",
      sm: "border-s-1",
      md: "border-s-2",
      lg: "border-s-3",
      xl: "border-s-4",
      none: ""
    },
    end: {
      zero: "border-e-0",
      sm: "border-e-1",
      md: "border-e-2",
      lg: "border-e-3",
      xl: "border-e-4",
      none: ""
    },
    x: {
      zero: "border-x-0",
      sm: "border-x-1",
      md: "border-x-2",
      lg: "border-x-3",
      xl: "border-x-4",
      none: ""
    },
    y: {
      zero: "border-y-0",
      sm: "border-y-1",
      md: "border-y-2",
      lg: "border-y-3",
      xl: "border-y-4",
      none: ""
    },
    left: {
      zero: "border-l-0",
      sm: "border-l-1",
      md: "border-l-2",
      lg: "border-l-3",
      xl: "border-l-4",
      none: ""
    },
    right: {
      zero: "border-r-0",
      sm: "border-r-1",
      md: "border-r-2",
      lg: "border-r-3",
      xl: "border-r-4",
      none: ""
    }
  },
  Default: "sm"
} as const satisfies ConfigObjectTree<ItemMap>

/* --- Size S Configuration ------------------------------------------------------------ */
export const SizeSvgConfig = {
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

/* --- Size Svg Stroke Configuration ------------------------------------------------------------ */
export const SizeSvgStrokeConfig = {
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

/* --- Max Width Configuration -------------------------------------------------------------------- */
export const SizeMaxWidthConfig = {
  Base:"mx-auto",
  Items: {
    xs: "max-w-sm",
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
    none: "",
  },
  Default: "xl"
} as const satisfies ConfigObject<ItemMap>

/* --- Padding Configuration -------------------------------------------------------------------- */
export const SizePaddingConfig = {
  Items: {
    xs: "p-004-1",
    sm: "p-008-2",
    md: "p-012-3",
    lg: "p-018-4",
    xl: "p-024-5",
    none: "",
  },
  Default: "md"
} as const satisfies ConfigObject<ItemMap>

/* --- Gaps Configuration ----------------------------------------------------------------------- */
export const SizeGapsConfig = {
  Items: {
    md: {
      xs: "gap-004-1",
      sm: "gap-008-2",
      md: "gap-012-3",
      lg: "gap-018-4",
      xl: "gap-024-5",
    },
    lg: {
      xs: "gap-008-2",
      sm: "gap-012-3",
      md: "gap-018-4",
      lg: "gap-024-5",
      xl: "gap-034-7",
    },
    xl: {
      xs: "gap-012-3",
      sm: "gap-018-4",
      md: "gap-024-5",
      lg: "gap-034-7",
      xl: "gap-056-M",
    }
  },
  Default: "md"
} as const satisfies ConfigObjectTree<ItemMap>

/* --- Size Button Configuration ----------------------------------------------------------------------- */
export const SizeButtonConfig = {
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