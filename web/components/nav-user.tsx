"use client"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout05Icon } from "@hugeicons/core-free-icons"

import { useSignOut } from "@/hooks/use-sign-out"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
  }
}) {
  const signOut = useSignOut()
  const initial = user.name.charAt(0).toUpperCase() || "?"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-3 px-2 py-2">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="rounded-full bg-foreground text-background text-sm font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-foreground/70">
              {user.email}
            </span>
          </div>
          <button
            type="button"
            aria-label="Log out"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <HugeiconsIcon icon={Logout05Icon} strokeWidth={2} className="size-4" />
          </button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/*
<DropdownMenuItem>
  <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} />
  Account
</DropdownMenuItem>
<DropdownMenuItem>
  <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
  Billing
</DropdownMenuItem>
<DropdownMenuItem>
  <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} />
  Notifications
</DropdownMenuItem>
*/
