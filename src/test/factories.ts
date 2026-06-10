/**
 * Factory functions for creating test data.
 *
 * All factories return partial entity shapes — spread what you need
 * and override specific fields via the `overrides` parameter.
 */

export const makeUser = (
  overrides: Partial<{
    id: string
    name: string
    email: string
  }> = {}
) => ({
  id: overrides.id ?? "user_01",
  name: overrides.name ?? "Test User",
  email: overrides.email ?? "test@example.com",
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeWorkspace = (
  overrides: Partial<{
    id: string
    name: string
    sector: string
  }> = {}
) => ({
  id: overrides.id ?? "ws_01",
  name: overrides.name ?? "Test Workspace",
  sector: overrides.sector ?? "office",
  address: "123 Test St",
  contactName: "Test",
  contactEmail: "test@example.com",
  phone: "01234567890",
  trialEndsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeMember = (
  overrides: Partial<{
    id: string
    workspaceId: string
    userId: string
    role: string
  }> = {}
) => ({
  id: overrides.id ?? "member_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  userId: overrides.userId ?? "user_01",
  role: overrides.role ?? "owner",
  invitedAt: new Date(),
  joinedAt: new Date(),
})

export const makeTask = (
  overrides: Partial<{
    id: string
    workspaceId: string
    title: string
    frequency: string
    category: string
    evidenceRequired: boolean
    active: boolean
    assignedUserId: string
    createdByUserId: string
  }> = {}
) => ({
  id: overrides.id ?? "task_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  templateItemId: null,
  title: overrides.title ?? "Test Task",
  description: "A test task",
  category: overrides.category ?? "fire_safety",
  frequency: overrides.frequency ?? "monthly",
  evidenceRequired: overrides.evidenceRequired ?? false,
  sourceLabel: null,
  sourceUrl: null,
  sortOrder: 0,
  assignedUserId: overrides.assignedUserId ?? "member_01",
  active: overrides.active ?? true,
  createdByUserId: overrides.createdByUserId ?? "user_01",
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeOccurrence = (
  overrides: Partial<{
    id: string
    workspaceId: string
    taskId: string
    dueDate: Date
    status: "due" | "completed"
    completedAt: Date | null
    completedByUserId: string | null
    notes: string | null
  }> = {}
) => ({
  id: overrides.id ?? "occ_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  taskId: overrides.taskId ?? "task_01",
  dueDate: overrides.dueDate ?? new Date(),
  status: overrides.status ?? "due",
  completedAt: overrides.completedAt ?? null,
  completedByUserId: overrides.completedByUserId ?? null,
  notes: overrides.notes ?? null,
})

export const makeInvitation = (
  overrides: Partial<{
    id: string
    email: string
    workspaceId: string
    token: string
    role: string
    expiresAt: Date
    usedAt: Date | null
  }> = {}
) => ({
  id: overrides.id ?? "inv_01",
  email: overrides.email ?? "invited@example.com",
  workspaceId: overrides.workspaceId ?? "ws_01",
  token: overrides.token ?? "valid-invite-token",
  role: overrides.role ?? "staff",
  expiresAt: overrides.expiresAt ?? new Date(Date.now() + 86400000),
  usedAt: overrides.usedAt ?? null,
  createdAt: new Date(),
})

export const makeNotification = (
  overrides: Partial<{
    id: string
    workspaceId: string
    userId: string | null
    type: string
    title: string
    body: string | null
    readAt: Date | null
  }> = {}
) => ({
  id: overrides.id ?? "notif_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  userId: overrides.userId ?? "user_01",
  type: overrides.type ?? "task_assigned",
  title: overrides.title ?? "Test Notification",
  body: overrides.body ?? "This is a test notification",
  readAt: overrides.readAt ?? null,
  createdAt: new Date(),
})

export const makeAuditLog = (
  overrides: Partial<{
    id: string
    workspaceId: string
    actorUserId: string | null
    actionType: string
    entityType: string
    entityId: string
  }> = {}
) => ({
  id: overrides.id ?? "log_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  actorUserId: overrides.actorUserId ?? "user_01",
  actionType: overrides.actionType ?? "task_completed",
  entityType: overrides.entityType ?? "task_occurrence",
  entityId: overrides.entityId ?? "occ_01",
  metadata: null,
  createdAt: new Date(),
})
