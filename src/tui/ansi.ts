export const ESC = '\x1b'
export const CSI = `${ESC}[`

export const ALT_SCREEN_ON = `${CSI}?1049h`
export const ALT_SCREEN_OFF = `${CSI}?1049l`
export const CURSOR_HIDE = `${CSI}?25l`
export const CURSOR_SHOW = `${CSI}?25h`
export const CLEAR_SCREEN = `${CSI}2J${CSI}H`

export const BOLD = `${CSI}1m`
export const DIM = `${CSI}2m`
export const UNDERLINE = `${CSI}4m`
export const RESET = `${CSI}0m`
export const INVERSE = `${CSI}7m`

export const FG_CYAN = `${CSI}36m`
export const FG_YELLOW = `${CSI}33m`
export const FG_GREEN = `${CSI}32m`
export const FG_RED = `${CSI}31m`
export const FG_GRAY = `${CSI}90m`
