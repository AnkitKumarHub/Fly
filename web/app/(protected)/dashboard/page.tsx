"use client"

import { useReducedMotion } from "motion/react"
import { motion } from "motion/react"

import { DashboardConnectCard } from "@/components/dashboard/dashboard-connect-card"
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting"
import { DashboardPriorityEmails } from "@/components/dashboard/dashboard-priority-emails"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { DashboardTodayEvents } from "@/components/dashboard/dashboard-today-events"
import {
  cardContainerVariants,
  dashboardTransition,
  dashboardDuration,
} from "@/components/dashboard/dashboard-motion"
import {
  getTodayEventCount,
  getUnreadInboxCount,
} from "@/components/dashboard/dashboard-utils"
import { useEmails } from "@/hooks/use-emails"
import { useEvents } from "@/hooks/use-events"
import { useIntegrations } from "@/hooks/use-integrations"
import { useMe } from "@/hooks/use-me"

export default function DashboardPage() {
  const reducedMotion = useReducedMotion() ?? false
  const { data: me } = useMe()
  const { connectedPlugins, isStatusLoading } = useIntegrations()

  const isGmailConnected = connectedPlugins.includes("gmail")
  const isCalendarConnected = connectedPlugins.includes("googlecalendar")

  const { data: emails = [], isLoading: isEmailsLoading } = useEmails(25, isGmailConnected)
  const { data: events = [], isLoading: isEventsLoading } = useEvents(50, isCalendarConnected)

  const unreadCount = isGmailConnected ? getUnreadInboxCount(emails) : 0
  const todayCount = isCalendarConnected ? getTodayEventCount(events) : 0
  const showDataSkeleton =
    isStatusLoading || (isGmailConnected && isEmailsLoading) || (isCalendarConnected && isEventsLoading)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:px-10 md:py-10">
      <DashboardGreeting name={me?.firstName} reducedMotion={reducedMotion} />

      <DashboardQuickActions unreadCount={unreadCount} todayCount={todayCount} />

      {showDataSkeleton ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          initial={reducedMotion ? false : "hidden"}
          animate="show"
          variants={cardContainerVariants}
          transition={dashboardTransition(reducedMotion, dashboardDuration.normal)}
          className="grid gap-4 md:grid-cols-2"
        >
          {isGmailConnected ? (
            <DashboardPriorityEmails
              emails={emails}
              isLoading={isEmailsLoading}
              reducedMotion={reducedMotion}
            />
          ) : (
            <DashboardConnectCard plugin="gmail" reducedMotion={reducedMotion} />
          )}

          {isCalendarConnected ? (
            <DashboardTodayEvents
              events={events}
              isLoading={isEventsLoading}
              reducedMotion={reducedMotion}
            />
          ) : (
            <DashboardConnectCard plugin="googlecalendar" reducedMotion={reducedMotion} />
          )}
        </motion.div>
      )}
    </div>
  )
}
