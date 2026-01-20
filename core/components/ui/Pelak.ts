/* --- NextUI-Pelak --- V:01.00.00 --- In The Name of God --- Good In Team --- Design by Love --- */
/* --- q.:| ♢ |:.p -------------------------------------------------- */
/* --- Thanks to God for everything and Good People ----------------- */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { Slot } from "@radix-ui/react-slot"
/* --- Configuration ------------------------------------------------ */
export { ThemeButtonConfig, ThemeInputConfig, FocusConfig } from './config/Theme'
export { SizeConfig, RoundedConfig, SvgStrokeSizeConfig, SvgSizeConfig, PaddingConfig, GapsConfig } from './config/Size'
/* --- Components --------------------------------------------------- */
import { Input } from './Input'
import { Button } from './Button'
import { Icon } from './Icon'
import { InputSecret } from './InputSecret'
import { AspectRatio } from './AspectRatio'
import { Container } from './Container'
import * as Dialog from './Dialog'
import * as Card from './Card'
import { Separator } from './Separator'
import { Skeleton } from './Skeleton'
import { Selector } from './Selector'
import { DateInput } from './DateInput'
import { DatePicker } from './DatePicker'
/* --- Types -------------------------------------------------------- */
type Properties = string | number | boolean | string[] | number[] | boolean[];
export type ItemMap = Record<string, Properties>
export type PropsMap = Record<string, ItemMap>
export type PropsObject<ItemMap> = {
  Base?: Properties;
  Items: ItemMap
}
export type ConfigObject<ItemMap> = {
  Base?: Properties;
  Items: ItemMap;
  Default: keyof ItemMap;
}
export type ConfigPropsObject<PropsObject, PropsMap, ItemMap> = {
  Base?: Properties;
  Props: Record<keyof PropsMap, PropsObject>;
  DefaultProps?: keyof PropsMap;
  Default: keyof ItemMap;
}
/* --- Functions ---------------------------------------------------- */
export function ClassName(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/* --- Exports ------------------------------------------------------ */
export const UI = {
  Container,
  Input,
  Button,
  Icon,
  InputSecret,
  AspectRatio,
  Separator,
  Skeleton,
  Selector,
  DateInput,
  DatePicker,
  ...Dialog,
  ...Card
}
/* --- q.:| ♢ |:.p -------------------------------------------------- */
/* --- Thanks God --------------------------------------------------- */
