import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

function Empty({ icon, title, description, action, className, ...props }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-16 text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="text-muted-foreground/50">{icon}</div>}
      {title && <p className="text-base font-medium">{title}</p>}
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { Empty }
