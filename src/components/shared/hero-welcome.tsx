import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { GraduationCap, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroWelcomeProps {
  userName: string
  roleLabel: string
  description?: string
  className?: string
}

export function HeroWelcome({ userName, roleLabel, description, className }: HeroWelcomeProps) {
  const now = new Date()
  const dateStr = format(now, "EEEE, d MMMM yyyy", { locale: localeId })

  return (
    <div className={cn(
      "relative rounded-xl bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground p-5 md:p-6 shadow-lg border border-primary/20",
      className
    )}>
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-blue-400/[0.06] blur-3xl" />
        <GraduationCap className="absolute right-8 -bottom-2 size-28 text-white/5 rotate-12 stroke-[1.5]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5">
        {/* Icon */}
        <div className="flex items-center justify-center size-12 rounded-xl bg-white/15 backdrop-blur shrink-0">
          <GraduationCap className="size-6" />
        </div>

        {/* Greeting + Role + Description */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
            Selamat datang, {userName}
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-1">
            <span className="text-xs font-semibold text-blue-100/80 tracking-wide">
              {roleLabel}
            </span>
          </div>
          {description && (
            <p className="text-sm text-blue-50/70 font-medium leading-relaxed mt-2 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="shrink-0 sm:text-right self-start sm:self-center">
          <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-wider">
            <Calendar className="size-3 inline mr-1" />
            Hari ini
          </p>
          <p className="text-sm font-bold text-white leading-tight mt-0.5 whitespace-nowrap">
            {dateStr}
          </p>
        </div>
      </div>
    </div>
  )
}
