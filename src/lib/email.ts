import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendInviteParams {
  email: string
  inviteLink: string
  workspaceName: string
  inviterName: string
}

export async function sendInviteEmail({
  email,
  inviteLink,
  workspaceName,
  inviterName,
}: SendInviteParams) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_xxxxx") {
    console.log(`[dev] Invite email to ${email}: ${inviteLink}`)
    return { ok: true }
  }

  const to = process.env.DEV_EMAIL_OVERRIDE ?? email
  const from = process.env.DEV_EMAIL_FROM ?? "SafeReady <noreply@safeready.app>"
  if (process.env.DEV_EMAIL_OVERRIDE) {
    console.log(`[dev] DEV_EMAIL_OVERRIDE: original → ${email}, redirecting to → ${to}`)
  }
  if (process.env.DEV_EMAIL_FROM) {
    console.log(`[dev] DEV_EMAIL_FROM: using sender → ${from}`)
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on SafeReady`,
    html: `<p>Hi,</p>
<p>${inviterName} has invited you to join <strong>${workspaceName}</strong> on SafeReady.</p>
<p><a href="${inviteLink}">Accept invitation</a></p>
<p>If you didn't expect this invitation, you can ignore this email.</p>`,
  })

  if (error) {
    console.error("Failed to send invite email:", error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
