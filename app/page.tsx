import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import {
  ArrowRight, Zap, ClipboardList, ShieldCheck, BarChart3,
  CheckCircle2, Clock, MessageSquare, ChevronUp,
  GitCommitHorizontal, Trophy,
} from "lucide-react"

const FEATURES = [
  { icon: ClipboardList, title: "Structured complaints", description: "Submit with title, description, priority, and media attachments. Every complaint is tracked from open to closed.", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: ShieldCheck, title: "Proof-gated resolution", description: "Caretakers must submit written proof and media before a complaint can be marked resolved. No rubber-stamping.", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: CheckCircle2, title: "Student approval loop", description: "Students review each resolution — approve to close the loop, or disapprove with a written reason to send it back.", color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: GitCommitHorizontal, title: "Full audit trail", description: "Every assignment, status change, escalation and resolution attempt logged in a GitHub-style activity timeline.", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: ChevronUp, title: "Community upvoting", description: "Students upvote complaints to surface the most pressing issues. Higher votes signal urgency without manual escalation.", color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: Trophy, title: "Caretaker leaderboard", description: "Supervisors track caretaker performance by points, complaints resolved, and first-attempt efficiency score.", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { icon: MessageSquare, title: "Discussion threads", description: "Each complaint has a comment section. Users can post, edit, and delete their own comments with a hover dropdown.", color: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/20" },
  { icon: BarChart3, title: "Media galleries", description: "Cloudinary-powered image and video uploads on complaints and resolutions, with a full-screen lightbox viewer.", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  { icon: Zap, title: "Dark / light mode", description: "System-default theme with a toggle accessible everywhere. Clean, consistent design across both modes.", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
]

const ROLES = [
  { role: "Student", step: "01", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", bar: "bg-blue-500", actions: ["Submit complaints with priority and media", "Upvote issues raised by others", "Track real-time status updates", "Approve or disapprove caretaker resolutions"] },
  { role: "Caretaker", step: "02", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500", actions: ["Self-assign complaints from the queue", "Start work and update progress", "Submit resolution proof with media", "Earn points on approved resolutions"] },
  { role: "Supervisor", step: "03", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", bar: "bg-violet-500", actions: ["View all complaints system-wide", "Monitor resolution timelines", "Track caretaker efficiency scores", "Identify bottlenecks and escalations"] },
]

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-125 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-125 h-100 bg-violet-500/4 rounded-full blur-3xl" />
          <div className="absolute top-10 left-0 w-100 h-87.5 bg-blue-500/4 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
            <Zap className="h-3 w-3" />
            Institutional complaint management, done right
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold tracking-tight text-foreground leading-[1.08] mb-6">
            Resolve Complaints Faster
            <br />
            <span className="text-foreground/40">with Full Accountability</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
            ResolveIt connects students, caretakers, and supervisors in one transparent platform — where every complaint is tracked, every resolution is proven, and every outcome is audited.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {session?.user ? (
              <Link href="/complaints" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-all duration-200">
                  Sign in
                </Link>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-muted-foreground">
            {[{ icon: CheckCircle2, label: "Resolution proof required" }, { icon: GitCommitHorizontal, label: "Full audit trail" }, { icon: ShieldCheck, label: "Role-based access" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-primary" />{label}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[{ value: "3", label: "User roles" }, { value: "5", label: "Lifecycle stages" }, { value: "100%", label: "Proof-gated" }, { value: "∞", label: "Resolution attempts" }].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Three roles. One clear process.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map(({ role, step, color, bg, bar, actions }) => (
            <div key={role} className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <span className="absolute top-4 right-5 text-6xl font-bold text-foreground/5 select-none">{step}</span>
              <div className={`h-0.5 w-10 rounded-full mb-5 ${bar}`} />
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mb-4 ${bg} ${color}`}>{role}</span>
              <ul className="space-y-2.5">
                {actions.map((action) => (
                  <li key={action} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                    <span className="text-sm text-muted-foreground leading-snug">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Everything you need to close the loop</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-18">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Lifecycle</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">A complaint&apos;s journey from open to closed</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">No complaint slips through. Every stage has a defined owner and the trail is always visible.</p>
          </div>
          <div className="relative">
            <div className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-px bg-border" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
              {[
                { label: "Pending", color: "bg-muted", text: "text-muted-foreground", icon: Clock },
                { label: "In Progress", color: "bg-blue-500/10", text: "text-blue-500", icon: Zap },
                { label: "Resolution", color: "bg-amber-500/10", text: "text-amber-500", icon: ShieldCheck },
                { label: "Resolved", color: "bg-emerald-500/10", text: "text-emerald-500", icon: CheckCircle2 },
                { label: "Closed", color: "bg-muted", text: "text-muted-foreground", icon: MessageSquare },
              ].map(({ label, color, text, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-2.5">
                  <div className={`relative z-10 h-10 w-10 rounded-full border border-border flex items-center justify-center ${color}`}>
                    <Icon className={`h-4 w-4 ${text}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
            <Zap className="h-3 w-3" />
            Ready to get started?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Replace informal channels with a system that works</h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto">Stop chasing updates over WhatsApp and email threads. Give every complaint a home, an owner, and a resolution.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {session?.user ? (
              <Link href="/complaints" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm">
                  Create your account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-all duration-200">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-purple-900 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">ResolveIt</span>
          </div>
          <p className="text-xs text-muted-foreground">&copy; CopyRight {new Date().getFullYear()} · ResolveIt</p>
        </div>
      </footer>
    </main>
  )
}