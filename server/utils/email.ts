import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Template engine ──────────────────────────────────────────────────────────
// Reads an HTML file from server/emails/, replaces all {{key}} tokens with
// the provided data object, and returns the final HTML string.

function renderTemplate(templateName: string, data: Record<string, string>): string {
  const templatePath = resolve(process.cwd(), 'server/emails', `${templateName}.html`)
  let html = readFileSync(templatePath, 'utf-8')

  // Replace every {{key}} token — missing keys become empty string, not broken placeholders
  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '')

  return html
}

// ─── Transporter ─────────────────────────────────────────────────────────────

function getTransporter() {
  const config = useRuntimeConfig()
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: Number(config.smtpPort) === 465,
    auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
  } as any)
}

// ─── Emails ───────────────────────────────────────────────────────────────────

export async function sendResumeEmail(to: string, resumeUrl: string, firstName = '') {
  const config = useRuntimeConfig()

  const html = renderTemplate('resume', {
    siteName: config.public.siteName || 'GrantPortal',
    firstName: firstName || 'there',
    email: to,
    resumeUrl,
  })

  if (!config.smtpHost) {
    console.log('[Email skipped — no SMTP] Resume URL:', resumeUrl)
    return
  }
  
  const cleanTo = (to || '').trim().replace(/[\r\n<>"']/g, '');
  if (!cleanTo || !cleanTo.includes('@')) {
    console.error('[Invalid recipient skipped]', to, '→ cleaned:', cleanTo);
    return;
  }
  
  // testMailjet(cleanTo);

  await getTransporter().sendMail({
    from: `"${config.public.siteName}" <${config.smtpFrom}>`,
    to: cleanTo,
    subject: `Resume Your Grant Application - ${config.public.siteName || 'GrantPortal'}`,
    envelope: {
      from: `"${config.public.siteName}" <${config.smtpFrom}>`,
      to: cleanTo,
    },
    html,
  })
}

export async function sendSubmissionConfirmation(
  to: string,
  data: {
    firstName: string
    lastName: string
    projectTitle: string
    grantCategory: string
    amountRequested: string   // pre-formatted by caller, e.g. "₦25,000"
  }
) {
  const config = useRuntimeConfig()

  const html = renderTemplate('confirmation', {
    siteName: config.public.siteName || 'GrantPortal',
    firstName: data.firstName,
    lastName: data.lastName,
    email: to,
    projectTitle: data.projectTitle || 'Untitled Project',
    grantCategory: data.grantCategory || '—',
    amountRequested: data.amountRequested || '—',
    submittedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    contactEmail: config.smtpFrom || 'grants@grantslortalngn.com',
    year: String(new Date().getFullYear()),
  })

  if (!config.smtpHost) {
    console.log('[Email skipped — no SMTP] Confirmation for:', to)
    return
  }
  
  const cleanTo = (to || '').trim().replace(/[\r\n<>"']/g, '');
  if (!cleanTo || !cleanTo.includes('@')) {
    console.error('[Invalid recipient skipped]', to, '→ cleaned:', cleanTo);
    return;
  }

  await getTransporter().sendMail({
    from: `"${config.public.siteName}" <${config.smtpFrom}>`,
    to: cleanTo,
    subject: `Application Received - ${config.public.siteName || 'GrantPortal'}`,
    envelope: {
      from: `"${config.public.siteName}" <${config.smtpFrom}>`,
      to: cleanTo,
    },
    html,
  })
}


export async function testMailjet(toEmail) {
  const t = getTransporter();
  const config = useRuntimeConfig()
  try {
    const info = await t.sendMail({
      from: `"${config.public.siteName}" <${config.smtpFrom}>`,
      to: toEmail,  // hardcoded clean
      subject: 'Hardcoded Nodemailer Test',
      text: 'If you see this, Nodemailer SMTP works!',
      envelope: {
        from: 'play.jenus@gmail.com',
        to: toEmail,
      },
    });
    console.log('Hardcoded test SUCCESS:', info);
  } catch (err) {
    console.error('Hardcoded test FAILED:', err);
  }
}
