import nodemailer from 'nodemailer'

function getTransporter() {
  const config = useRuntimeConfig()
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    auth: config.smtpUser ? {
      user: config.smtpUser,
      pass: config.smtpPass
    } : undefined,
    secure: Number(config.smtpPort) === 465,
  } as any)
}

export async function sendResumeEmail(to: string, resumeUrl: string) {
  const config = useRuntimeConfig()
  if (!config.smtpHost) {
    console.log('[Email skipped - no SMTP configured] Resume URL:', resumeUrl)
    return
  }
  const t = getTransporter()
  await t.sendMail({
    from: config.smtpFrom,
    to,
    subject: 'Resume Your Grant Application — GrantPortal',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 24px; color: #1a3a2a; font-family: Georgia, serif;">GrantPortal</span>
        </div>
        <h2 style="color: #1a3a2a; margin: 0 0 16px; font-size: 22px;">Continue Your Application</h2>
        <p style="color: #555; line-height: 1.7; margin: 0 0 24px;">
          Here's your link to pick up where you left off. This link is valid for 30 days.
        </p>
        <a href="${resumeUrl}"
          style="display: inline-block; padding: 14px 28px; background: #1a3a2a; color: white; text-decoration: none; border-radius: 100px; font-family: sans-serif; font-size: 14px; font-weight: 600;">
          Resume My Application →
        </a>
        <p style="color: #bbb; font-size: 12px; margin-top: 40px; font-family: sans-serif; border-top: 1px solid #f0ede6; padding-top: 24px;">
          If you didn't request this, please ignore this email. The link only works once your session is active.
        </p>
      </div>
    `
  })
}

export async function sendSubmissionConfirmation(to: string, firstName: string) {
  const config = useRuntimeConfig()
  if (!config.smtpHost) {
    console.log('[Email skipped - no SMTP configured] Confirmation for:', to)
    return
  }
  const t = getTransporter()
  await t.sendMail({
    from: config.smtpFrom,
    to,
    subject: 'Application Received — GrantPortal',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 24px; color: #1a3a2a;">GrantPortal</span>
        </div>
        <h2 style="color: #1a3a2a; margin: 0 0 16px; font-size: 22px;">Application Received${firstName ? ', ' + firstName : ''}!</h2>
        <p style="color: #555; line-height: 1.7; margin: 0 0 16px;">
          Thank you for submitting your grant application. Our team will begin reviewing it after the application deadline closes.
        </p>
        <p style="color: #555; line-height: 1.7; margin: 0 0 32px;">
          You can expect to hear from us within <strong>60 days of the deadline</strong>. Every applicant receives a response.
        </p>
        <p style="color: #bbb; font-size: 12px; font-family: sans-serif; border-top: 1px solid #f0ede6; padding-top: 24px;">
          Questions? Reply to this email or contact grants@grantsportalngn.com
        </p>
      </div>
    `
  })
}
