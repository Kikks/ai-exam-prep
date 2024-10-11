import { atom } from "jotai";

export const sidebarOpenAtom = atom(false);
export const pageTitleAtom = atom<string | null>(null);
export const topupDialogOpenAtom = atom(false);
export const insufficientCreditsDialogOpenAtom = atom(false);
