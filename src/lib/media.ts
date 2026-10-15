/** Hero video status shared between the hero (writer) and the preloader (reader).
 *  A plain mutable object: it changes every network chunk, so it must never be React state. */
export interface HeroMedia { loadPct: number | null; failed: boolean; video: HTMLVideoElement | null }
export const createHeroMedia = (): HeroMedia => ({ loadPct: null, failed: false, video: null })
