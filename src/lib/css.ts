import type { CSSProperties } from 'react'

const cache = new Map<string, CSSProperties>()

/** Turns an inline CSS string (as written in the original HTML) into a React style object.
 *  Keeps the original declarations byte-for-byte so the design can't drift during migration. */
export function css(text: string): CSSProperties {
  const hit = cache.get(text)
  if (hit) return hit
  const out: Record<string, string> = {}
  let depth = 0, start = 0
  const decls: string[] = []
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (c === ';' && depth === 0) { decls.push(text.slice(start, i)); start = i + 1 }
  }
  decls.push(text.slice(start))
  for (const d of decls) {
    const k = d.indexOf(':')
    if (k < 0) continue
    const prop = d.slice(0, k).trim()
    const camel = prop.replace(/^-(webkit|moz|ms)-/, (_, v: string) => v[0].toUpperCase() + v.slice(1) + '-')
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[camel] = d.slice(k + 1).trim()
  }
  if (cache.size > 2000) cache.clear()
  cache.set(text, out)
  return out
}
