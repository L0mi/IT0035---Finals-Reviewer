import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-cyan">{eyebrow}</p><h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-slate-400">{description}</p></div>{action}
  </header>
}

export function SourceNote({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100"><Info className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div aria-label={label ?? `${safe}% complete`} role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${safe}%` }} /></div>
}

export function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="card p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p>{detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}</div>
}

export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return <div className="card border-dashed p-8 text-center"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-400">{children}</p></div>
}
