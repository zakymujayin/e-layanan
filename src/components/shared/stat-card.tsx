import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  color?: "primary" | "warning" | "success" | "accent"
  className?: string
}

const COLOR_STYLES = {
  primary: {
    card: "hover:shadow-primary/10 hover:border-primary/20",
    bar: "bg-primary",
    icon: "bg-primary/10 text-primary",
  },
  warning: {
    card: "hover:shadow-amber-500/10 hover:border-amber-500/20",
    bar: "bg-amber-500",
    icon: "bg-amber-100 text-amber-700",
  },
  success: {
    card: "hover:shadow-emerald-500/10 hover:border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: "bg-emerald-100 text-emerald-700",
  },
  accent: {
    card: "hover:shadow-purple-500/10 hover:border-purple-500/20",
    bar: "bg-purple-500",
    icon: "bg-purple-100 text-purple-700",
  },
}

export function StatCard({ title, value, description, icon: Icon, color = "primary", className }: StatCardProps) {
  const styles = COLOR_STYLES[color]
  
  return (
    <Card className={cn(
      "relative overflow-hidden shadow-sm hover:shadow-md transition-all border",
      styles.card,
      className
    )}>
      <div className={cn("absolute top-0 left-0 w-1 h-full", styles.bar)} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex items-center justify-center size-9 rounded-lg", styles.icon)}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
