import { cn } from "@/lib/utils"
import { Crown, Shield, User } from "lucide-react"

type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER"

const roleStyles: Record<OrganizationRole, { label: string; className: string; icon: typeof Crown }> = {
    OWNER: {
        label: "Owner",
        className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        icon: Crown,
    },
    ADMIN: {
        label: "Admin",
        className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: Shield,
    },
    MEMBER: {
        label: "Member",
        className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700",
        icon: User,
    },
}

interface BadgeRoleProps {
    role?: OrganizationRole
    className?: string
}

/**
 * Role badge for organization members.
 * @param role Organization role variant to render. Defaults to "MEMBER".
 * @param className Optional extra classes for custom sizing/spacing.
 * @example
 * // Renders "Owner" badge with amber tones and crown icon
 * <BadgeRole role="OWNER" />
 */
export const BadgeRole = ({ role = "MEMBER", className }: BadgeRoleProps) => {
    const { label, className: roleClassName, icon: Icon } = roleStyles[role]

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            roleClassName,
            className
        )}>
            <Icon className="size-3" />
            {label}
        </span>
    )
}
