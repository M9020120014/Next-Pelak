import { PropsMap, ItemMap, ConfigPropsObject, ConfigObject, PropsObject } from "../Pelak";
/* --- Theme Button Configuration --------------------------------------------------------------- */
export const ThemeButtonConfig = {
  Base:
    "inline-flex items-center justify-center whitespace-nowrap" + " " +
    "py-008-2 gap-008-2" + " " +
    "transition-all disabled:pointer-events-none [&_svg]:pointer-events-none cursor-pointer" + " " +
    "aria-invalid:ring-Error/40 aria-invalid:border-Error" + " " +
    "shrink-0 [&_svg]:shrink-0",
  Props: {
    default: {
      Base: "border disabled:border-Panel disabled:bg-Border disabled:text-Mid",
      Items: {
        primary: "bg-Primary border-PrimaryLight text-PrimaryForeground hover:bg-PrimaryDark hover:border-Primary active:bg-PrimaryLight",
        secondary: "bg-Secondary border-SecondaryLight text-SecondaryForeground hover:bg-SecondaryDark hover:border-Secondary active:bg-SecondaryLight",
        third: "bg-Third border-ThirdLight text-ThirdForeground hover:bg-ThirdDark hover:border-Third active:bg-ThirdLight",
        success: "bg-Success border-SuccessLight text-SuccessForeground hover:bg-SuccessDark hover:border-Success active:bg-SuccessLight",
        error: "bg-Error border-ErrorLight text-ErrorForeground hover:bg-ErrorDark hover:border-Error active:bg-ErrorLight",
        warning: "bg-Warning border-WarningLight text-WarningForeground hover:bg-WarningDark hover:border-Warning active:bg-WarningLight",
        dark: "bg-Shadow border-Mid text-Panel hover:bg-Text hover:border-Shadow active:bg-Mid",
        light: "bg-Panel border-Border text-Text hover:bg-Background hover:border-Panel active:bg-Border",
        black: "bg-Black/90 border-Black/72 text-White hover:bg-Black hover:border-Black/90 active:bg-Black/90",
        white: "bg-White/90 border-White/72 text-Black hover:bg-White hover:border-White/90 active:bg-White/90",
        none: ""
        // Base: border disabled:border-[GrayColorLighter] disabled:bg-[GrayColorLight] disabled:text-[GrayColor]
        // Color: bg-[Color] border-[ColorLight] text-[ColorForeground] hover:bg-[ColorDark] hover:border-[Color] active:bg-[ColorLight]
      }
    },
    outline: {
      Base: "border disabled:border-Border disabled:text-Mid shadow-sm hover:shadow-xs active:shadow-0 shadow-Text/18",
      Items: {
        primary: "border-Primary text-Primary hover:bg-Primary/12 hover:border-PrimaryDark hover:text-PrimaryDark active:bg-Primary/18 active:text-Primary",
        secondary: "border-Secondary text-Secondary hover:bg-Secondary/12 hover:border-SecondaryDark hover:text-SecondaryDark active:bg-Secondary/18 active:text-Secondary",
        third: "border-Third text-Third hover:bg-Third/12 hover:border-ThirdDark hover:text-ThirdDark active:bg-Third/18 active:text-Third",
        success: "border-Success text-Success hover:bg-Success/12 hover:border-SuccessDark hover:text-SuccessDark active:bg-Success/18 active:text-Success",
        error: "border-Error text-Error hover:bg-Error/12 hover:border-ErrorDark hover:text-ErrorDark active:bg-Error/18 active:text-Error",
        warning: "border-Warning text-Warning hover:bg-Warning/12 hover:border-WarningDark hover:text-WarningDark active:bg-Warning/18 active:text-Warning",
        dark: "border-Shadow text-Shadow hover:bg-Shadow/12 hover:border-Text hover:text-Text active:bg-Shadow/18 active:text-Shadow",
        light: "border-Panel text-Panel hover:bg-Panel/12 hover:border-Background hover:text-Background active:bg-Panel/18 active:text-Panel",
        black: "border-Black/80 text-Black/80 hover:bg-Black/12 hover:border-Black hover:text-Black active:bg-Black/18 active:text-Black/80",
        white: "border-white/80 text-white/80 hover:bg-white/12 hover:border-white hover:text-white active:bg-white/18 active:text-white/80",
        none: ""
        // Base: border disabled:border-[GrayColorLight] disabled:text-[GrayColor] shadow-sm hover:shadow-xs active:shadow-0 shadow-[GrayColorDaeker]/18
        // Color: border-[Color] text-[Color] hover:bg-[Color]/12 hover:border-[Color] hover:text-[Color] active:bg-[Color]/18 active:text-[Color]
      }
    },
    ghost: {
      Base: "text-Text disabled:text-Mid",
      Items: {
        primary: "hover:bg-PrimaryLight/34 hover:text-PrimaryDark active:bg-PrimaryDark/34",
        secondary: "hover:bg-SecondaryLight/34 hover:text-SecondaryDark active:bg-SecondaryDark/34",
        third: "hover:bg-ThirdLight/34 hover:text-ThirdDark active:bg-ThirdDark/34",
        success: "hover:bg-SuccessLight/34 hover:text-SuccessDark active:bg-SuccessDark/34",
        error: "hover:bg-ErrorLight/34 hover:text-ErrorDark active:bg-ErrorDark/34",
        warning: "hover:bg-WarningLight/34 hover:text-WarningDark active:bg-WarningDark/34",
        dark: "hover:bg-Shadow/34 hover:text-Foreground active:bg-Foreground/34",
        light: "hover:bg-Border/34 hover:text-Shadow active:bg-Mid/34",
        black: "text-Black hover:bg-Black/18 hover:text-Black active:bg-Black/34",
        white: "text-White hover:bg-White/18 hover:text-White active:bg-White/34",
        none: ""
        // Base: text-[GrayColorDaeker] disabled:text-[GrayColor]
        // Color: hover:bg-[ColorLight]/34 hover:text-[ColorDark] active:bg-[ColorDark]/34
      }
    },
    link: {
      Base: "underline-offset-4 hover:underline disabled:text-Mid disabled:underline",
      Items: {
        primary: "text-Primary hover:text-PrimaryDark active:text-PrimaryLight",
        secondary: "text-Secondary hover:text-SecondaryDark active:text-SecondaryLight",
        third: "text-Third hover:text-ThirdDark active:text-ThirdLight",
        success: "text-Success hover:text-SuccessDark active:text-SuccessLight",
        error: "text-Error hover:text-ErrorDark active:text-ErrorLight",
        warning: "text-Warning hover:text-WarningDark active:text-WarningLight",
        dark: "text-Text hover:text-Foreground active:text-Shadow",
        light: "text-Panel hover:text-Background active:text-Border",
        black: "text-Black/80 hover:text-Black active:text-Black/72",
        white: "text-White/80 hover:text-White active:text-White/72",
        none: ""
        // Base: underline-offset-4 hover:underline disabled:text-[GrayColor] disabled:underline
        // Color: text-[Color] hover:text-[ColorDark] active:text-[ColorLight]
      }
    }
  },
  DefaultProps: "default",
  Default: "dark"
} as const satisfies ConfigPropsObject<PropsObject<ItemMap>, PropsMap, ItemMap>

/* --- Theme Input Configuration ---------------------------------------------------------------- */
export const ThemeInputConfig = {
  Base: "w-full min-w-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
  Props: {
    default: {
      Base: "aria-invalid:ring-Error/40 aria-invalid:border-Error",
      Items: {
        default:
          "bg-Lightness border border-Border" + " " +
          "file:text-Mid file:inline-flex file:border-0 file:h-034-7" + " " +
          "placeholder:text-Mid" + " " +
          "selection:bg-Shadow selection:text-Background",
        none: ""
        // Base: aria-invalid:ring-[ErrorColor]/40 aria-invalid:border-[ErrorColor]
        // Color:
        //  bg-transparent border border-[ColorDark]
        //  file:text-[Color] file:inline-flex file:border-0 file:h-034-7
        //  placeholder:text-[Color]
        //  selection:bg-[ColorDark] selection:text-[ColorLighter]
      }
    }
  },
  DefaultProps: "default",
  Default: "default",
} as const satisfies ConfigPropsObject<PropsObject<ItemMap>, PropsMap, ItemMap>

/* --- TFocus Configuration --------------------------------------------------------------------- */
export const FocusConfig = {
  Base: "outline-none focus-visible:ring-2",
  Items: {
    primary: "focus-visible:border-PrimaryDark focus-visible:ring-PrimaryDark/40",
    secondary: "focus-visible:border-SecondaryDark focus-visible:ring-SecondaryDark/40",
    third: "focus-visible:border-ThirdDark focus-visible:ring-ThirdDark/40",
    success: "focus-visible:border-SuccessDark focus-visible:ring-SuccessDark/40",
    error: "focus-visible:border-ErrorDark focus-visible:ring-ErrorDark/40",
    warning: "focus-visible:border-WarningDark focus-visible:ring-WarningDark/40",
    none: ""
    // Base: outline-none focus-visible:ring-2
    // Color: focus-visible:border-[ColorDark] focus-visible:ring-[ColorDark]/40
  },
  Default: "secondary"
} as const satisfies ConfigObject<ItemMap>