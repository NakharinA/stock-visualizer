// Number formatters ported from the design handoff (project/lib/ui.jsx).

export function fmtPrice(x: number | null | undefined, dp = 2): string {
  if (x == null || Number.isNaN(x)) return '—'
  return x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

export function fmtSigned(x: number | null | undefined): string {
  if (x == null || Number.isNaN(x)) return '—'
  return (x >= 0 ? '+' : '') + fmtPrice(x)
}

export function fmtPct(x: number | null | undefined): string {
  if (x == null || Number.isNaN(x)) return '—'
  return (x >= 0 ? '+' : '') + x.toFixed(2) + '%'
}

export function fmtCompact(x: number | null | undefined): string {
  if (x == null || Number.isNaN(x)) return '—'
  const a = Math.abs(x)
  if (a >= 1e12) return (x / 1e12).toFixed(2) + 'T'
  if (a >= 1e9) return (x / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return (x / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return (x / 1e3).toFixed(1) + 'K'
  return String(x)
}
