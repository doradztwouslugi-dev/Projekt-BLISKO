import type { AccessPlan } from './userStore';

export const PLAN_LIMITS: Record<AccessPlan, {
  newConversationsPerPeriod: number;
  maxActiveConversations: number;
  periodDays: number;
}> = {
  free: {
    newConversationsPerPeriod: 2,
    maxActiveConversations: 2,
    periodDays: 7,
  },
  plus: {
    newConversationsPerPeriod: 5,
    maxActiveConversations: 10,
    periodDays: 7,
  },
  premium: {
    newConversationsPerPeriod: Number.POSITIVE_INFINITY,
    maxActiveConversations: Number.POSITIVE_INFINITY,
    periodDays: 7,
  },
};

export type ConversationStart = {
  userId: string;
  postId: string;
  createdAt: string;
};

export type ConversationLimitStatus = {
  allowed: boolean;
  reason?: 'weekly_limit' | 'active_limit';
  usedThisPeriod: number;
  activeCount: number;
  weeklyLimit: number;
  activeLimit: number;
  periodEndsAt: Date;
};

/** A usage period is seven days long and anchored to the user's account creation date. */
export function getConversationLimitStatus({
  plan,
  userId,
  accountCreatedAt,
  starts,
  now = new Date(),
}: {
  plan: AccessPlan;
  userId: string;
  accountCreatedAt: string;
  starts: ConversationStart[];
  now?: Date;
}): ConversationLimitStatus {
  const limits = PLAN_LIMITS[plan];
  const createdAt = new Date(accountCreatedAt);
  const anchor = Number.isNaN(createdAt.getTime()) ? now : createdAt;
  const periodMs = limits.periodDays * 24 * 60 * 60 * 1000;
  const elapsedPeriods = Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / periodMs));
  const periodStart = new Date(anchor.getTime() + elapsedPeriods * periodMs);
  const periodEndsAt = new Date(periodStart.getTime() + periodMs);
  const mine = starts.filter((start) => start.userId === userId);
  const usedThisPeriod = mine.filter((start) => {
    const timestamp = new Date(start.createdAt).getTime();
    return timestamp >= periodStart.getTime() && timestamp <= now.getTime();
  }).length;
  // In this prototype, a conversation is considered active for 30 days after it was started.
  const activeCutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const activeCount = mine.filter((start) => new Date(start.createdAt).getTime() >= activeCutoff).length;
  const reason = activeCount >= limits.maxActiveConversations
    ? 'active_limit'
    : usedThisPeriod >= limits.newConversationsPerPeriod
      ? 'weekly_limit'
      : undefined;

  return {
    allowed: !reason,
    reason,
    usedThisPeriod,
    activeCount,
    weeklyLimit: limits.newConversationsPerPeriod,
    activeLimit: limits.maxActiveConversations,
    periodEndsAt,
  };
}
