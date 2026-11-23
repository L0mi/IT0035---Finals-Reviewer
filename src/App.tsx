import { useEffect, useState } from 'react'
import { Award, BarChart3, BookMarked, BookOpen, BrainCircuit, Calculator, ChevronLeft, ChevronRight, CircleHelp, FileText, FlaskConical, Gauge, GraduationCap, Menu, Settings, Sparkles, X } from 'lucide-react'
import type { NavId, ProgressData } from './types'
import { loadProgress, saveProgress } from './storage'
import { AchievementsPage, ComputationPage, Dashboard, FormulaPage, LearningPage, MaterialsPage, MistakesPage, ProgressPage, ReviewersPage, SettingsPage } from './components/Pages'
import QuizArena from './components/QuizArena'
import { PageHeader, SourceNote } from './components/common'

const nav: { id: NavId; label: string; icon: typeof Gauge }[] = [
  {id:'dashboard',label:'Dashboard',icon:Gauge},{id:'path',label:'Learning Path',icon:GraduationCap},
  {id:'module1',label:'Module 1',icon:BookOpen},{id:'module2',label:'Module 2',icon:BookOpen},{id:'module3',label:'Module 3',icon:BookOpen},{id:'module4',label:'Module 4',icon:BookOpen},
  {id:'materials',label:'Course PDFs',icon:FileText},
  {id:'lab',label:'Computation Lab',icon:FlaskConical},{id:'formulas',label:'Formula Sheet',icon:Calculator},{id:'reviewers',label:'Reviewers',icon:BookMarked},
  {id:'quiz',label:'Quiz Arena',icon:BrainCircuit},{id:'mistakes',label:'Mistake Notebook',icon:CircleHelp},{id:'achievements',label:'Achievements',icon:Award},{id:'progress',label:'Progress',icon:BarChart3},{id:'settings',label:'Settings',icon:Settings},
]

export default function App() {
  const [page,setPage]=useState<NavId>('dashboard')
  const [collapsed,setCollapsed]=useState(false)
  const [mobile,setMobile]=useState(false)
  const [progress,setProgress]=useState<ProgressData>(()=>loadProgress())
  useEffect(()=>saveProgress(progress),[progress])
  useEffect(()=>{document.documentElement.classList.toggle('motion-reduce',progress.settings.reducedMotion)},[progress.settings.reducedMotion])
  const go=(id:NavId)=>{setPage(id);setMobile(false);window.scrollTo({top:0,behavior:progress.settings.reducedMotion?'auto':'smooth'})}
  return <div className="min-h-screen bg-ink text-slate-100">
    <button onClick={()=>setMobile(true)} className="btn fixed left-3 top-3 z-30 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5"/></button>
    {mobile&&<button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={()=>setMobile(false)}/>} 
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-[#0c101c] transition-[width,transform] ${collapsed?'w-[76px]':'w-[260px]'} ${mobile?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-line px-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet to-cyan text-slate-950"><Sparkles className="h-5 w-5"/></div>{!collapsed&&<div><p className="font-black leading-tight">OS Learning Hub</p><p className="text-[11px] text-slate-500">IT0035 · Finals</p></div>}<button className="ml-auto text-slate-500 lg:hidden" onClick={()=>setMobile(false)}><X/></button></div>
      <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">{nav.map(({id,label,icon:Icon})=><button title={label} onClick={()=>go(id)} key={id} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${page===id?'bg-violet text-slate-950':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon className="h-[18px] w-[18px] shrink-0"/>{!collapsed&&label}</button>)}</nav>
      <div className="border-t border-line p-3"><button className="btn w-full px-2" onClick={()=>setCollapsed(v=>!v)}>{collapsed?<ChevronRight className="h-4 w-4"/>:<><ChevronLeft className="h-4 w-4"/>Collapse</>}</button></div>
    </aside>
    <main className={`min-h-screen transition-[margin] ${collapsed?'lg:ml-[76px]':'lg:ml-[260px]'}`}><div className="mx-auto max-w-[1500px] px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-8"><Page page={page} go={go} progress={progress} setProgress={setProgress}/></div></main>
  </div>
}

function Page({page,go,progress,setProgress}:{page:NavId;go:(id:NavId)=>void;progress:ProgressData;setProgress:(p:ProgressData)=>void}) {
  if(page==='dashboard')return <Dashboard progress={progress} go={go}/>
  if(page==='path')return <LearningPage progress={progress} setProgress={setProgress} go={go}/>
  if(/^module/.test(page))return <LearningPage module={Number(page.at(-1)) as 1|2|3|4} progress={progress} setProgress={setProgress} go={go}/>
  if(page==='materials')return <MaterialsPage go={go}/>
  if(page==='lab')return <ComputationPage/>
  if(page==='formulas')return <FormulaPage go={go}/>
  if(page==='reviewers')return <ReviewersPage progress={progress} setProgress={setProgress}/>
  if(page==='quiz')return <><PageHeader eyebrow="Train & test" title="Quiz Arena" description="Five real session modes with hints, delayed exam feedback, saved results, XP protection, and full answer review."/><QuizArena progress={progress} setProgress={setProgress}/></>
  if(page==='mistakes')return <MistakesPage progress={progress} setProgress={setProgress} go={go}/>
  if(page==='achievements')return <AchievementsPage progress={progress}/>
  if(page==='progress')return <ProgressPage progress={progress}/>
  if(page==='settings')return <SettingsPage progress={progress} setProgress={setProgress}/>
  return <><PageHeader eyebrow="Not found" title="Page unavailable" description="Choose a destination from the navigation."/><SourceNote>This route is not recognized.</SourceNote></>
}
