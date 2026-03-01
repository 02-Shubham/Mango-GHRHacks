import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

const LEAKED_FILE = path.join(process.cwd(), 'leaked-cases.json')
function persistLeakedId(caseId: number) {
  let ids: number[] = []
  try { if (fs.existsSync(LEAKED_FILE)) ids = JSON.parse(fs.readFileSync(LEAKED_FILE, 'utf-8')); } catch { }
  if (!ids.includes(caseId)) { ids.push(caseId); fs.writeFileSync(LEAKED_FILE, JSON.stringify(ids)); }
}

function buildHtmlEmail(data: any) {
  const { caseId, title, description, department, status, reporter, filedDate, fileHash, metadataCID, fileCID, encryptionInfo, ipfsMetadataUrl, ipfsFileUrl, recipients, timestamp } = data

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; background: #f8f9fa; padding: 0; margin: 0;">
  <div style="max-width: 680px; margin: 0 auto; background: white; border: 2px solid #dc2626; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 32px 40px; color: white;">
      <div style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8; margin-bottom: 8px;">⚠️ PUBLIC INTEREST DISCLOSURE</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Verified Whistleblower Leak</h1>
      <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">Case #${caseId} — Dispatched via NyayaSetu Decentralized Legal Network</p>
    </div>
    <div style="padding: 40px;">
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 12px; color: #991b1b; font-weight: 600;">🔒 This disclosure is cryptographically verifiable. All evidence hashes and IPFS links can be independently verified on the blockchain.</p>
      </div>

      <!-- CASE BRIEF -->
      <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 10px; padding: 24px 28px; margin-bottom: 28px;">
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #b45309; font-weight: 800; margin-bottom: 12px;">📋 CASE BRIEF</div>
        <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #1a1a2e;">${title}</h2>
        <table style="font-size: 13px; color: #374151; margin-bottom: 14px;">
          <tr><td style="padding: 3px 16px 3px 0; color: #6b7280; font-weight: 600;">Department</td><td style="padding: 3px 0; font-weight: 700;">${department}</td></tr>
          <tr><td style="padding: 3px 16px 3px 0; color: #6b7280; font-weight: 600;">Status</td><td style="padding: 3px 0; font-weight: 700;">${status}</td></tr>
          <tr><td style="padding: 3px 16px 3px 0; color: #6b7280; font-weight: 600;">Filed On</td><td style="padding: 3px 0; font-weight: 700;">${filedDate}</td></tr>
          <tr><td style="padding: 3px 16px 3px 0; color: #6b7280; font-weight: 600;">Reporter</td><td style="padding: 3px 0; font-family: monospace; font-size: 12px;">${reporter || 'Anonymous'}</td></tr>
        </table>
        <div style="border-top: 1px solid #fcd34d; padding-top: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Description</div>
          <p style="font-size: 14px; line-height: 1.8; color: #1a1a2e; margin: 0;">${description || 'No description provided. Refer to the attached IPFS metadata for full case details.'}</p>
        </div>
      </div>
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Cryptographic Verification</h3>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 28px;">
        <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Evidence Hash</td><td style="padding: 8px 0; font-family: monospace; font-size: 11px; word-break: break-all; color: #1a1a2e;">${fileHash || 'N/A'}</td></tr>
        <tr style="border-top: 1px solid #f3f4f6;"><td style="padding: 8px 0; color: #6b7280;">Metadata CID</td><td style="padding: 8px 0; font-family: monospace; font-size: 11px; word-break: break-all; color: #1a1a2e;">${metadataCID || 'N/A'}</td></tr>
        <tr style="border-top: 1px solid #f3f4f6;"><td style="padding: 8px 0; color: #6b7280;">Reporter Wallet</td><td style="padding: 8px 0; font-family: monospace; font-size: 11px; color: #1a1a2e;">${reporter || 'Anonymous'}</td></tr>
        <tr style="border-top: 1px solid #f3f4f6;"><td style="padding: 8px 0; color: #6b7280;">Encryption</td><td style="padding: 8px 0; font-size: 11px; color: #1a1a2e;">${encryptionInfo || 'AES-256-GCM + RSA-2048'}</td></tr>
      </table>
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Verification Links</h3>
      <div style="margin-bottom: 28px;">
        ${ipfsMetadataUrl ? `<p style="margin: 0 0 6px;"><a href="${ipfsMetadataUrl}" style="color: #2563eb; font-size: 12px;">📄 IPFS Metadata (Full Case Record)</a></p>` : ''}
        ${ipfsFileUrl ? `<p style="margin: 0;"><a href="${ipfsFileUrl}" style="color: #2563eb; font-size: 12px;">📎 IPFS Evidence File (Encrypted)</a></p>` : ''}
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; font-size: 11px; color: #6b7280; line-height: 1.6;">
        <strong style="color: #374151;">Audit Record:</strong><br>
        Case ID: ${caseId}<br>Disclosure Timestamp: ${timestamp}<br>Recipients: ${recipients.join(', ')}<br>Source: NyayaSetu Admin Panel — CivicChainRegistry<br>Network: Ethereum (Hardhat Local / Testnet)
      </div>
    </div>
    <div style="background: #1a1a2e; padding: 24px 40px; color: #9ca3af; font-size: 10px; line-height: 1.6;">
      <p style="margin: 0;">This email was generated by <strong style="color: white;">NyayaSetu</strong> — a decentralized whistleblower protection platform. All evidence is immutably stored on IPFS and verified on-chain.</p>
    </div>
  </div>
</body>
</html>`
}

function buildPlainText(data: any) {
  return `⚠️ VERIFIED WHISTLEBLOWER LEAK — Case #${data.caseId}

Title: ${data.title}
Department: ${data.department}
Status: ${data.status}
Filed: ${data.filedDate}

DESCRIPTION:
${data.description || 'No description available.'}

CRYPTOGRAPHIC VERIFICATION:
Evidence Hash: ${data.fileHash || 'N/A'}
Metadata CID: ${data.metadataCID || 'N/A'}
Reporter Wallet: ${data.reporter || 'Anonymous'}
Encryption: ${data.encryptionInfo || 'AES-256-GCM'}

VERIFICATION LINKS:
Metadata: ${data.ipfsMetadataUrl || 'N/A'}
Evidence: ${data.ipfsFileUrl || 'N/A'}

AUDIT RECORD:
Case ID: ${data.caseId}
Timestamp: ${data.timestamp}
Recipients: ${data.recipients.join(', ')}
Source: NyayaSetu Admin Panel — CivicChainRegistry

---
This disclosure was generated by NyayaSetu — a decentralized whistleblower protection platform.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caseId, title, recipients } = body

    if (!caseId || !title || !recipients?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    const timestamp = new Date().toISOString()
    const subject = `⚠️ VERIFIED WHISTLEBLOWER LEAK — Case #${caseId}: ${title}`
    const emailData = { ...body, timestamp }

    // ─── Try sending via SMTP ───
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: gmailUser, pass: gmailPass },
          tls: { rejectUnauthorized: false },
        })

        const info = await transporter.sendMail({
          from: `"NyayaSetu Disclosure" <${gmailUser}>`,
          to: recipients.join(', '),
          subject,
          text: buildPlainText(emailData),
          html: buildHtmlEmail(emailData),
        })

        const auditLog = { caseId, timestamp, recipients, sender: gmailUser, messageId: info.messageId, status: 'DISPATCHED' }
        console.log('📨 LEAK DISPATCHED:', JSON.stringify(auditLog, null, 2))
        persistLeakedId(caseId)

        return NextResponse.json({ success: true, auditLog, message: `Dispatched to ${recipients.length} recipient(s).`, method: 'smtp' })
      } catch (smtpErr: any) {
        console.error('SMTP failed:', smtpErr.message)
        // Fall through to Gmail compose fallback
      }
    }

    // ─── Fallback: Gmail Compose URL ───
    const plainBody = buildPlainText(emailData)
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(recipients.join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`

    const auditLog = { caseId, timestamp, recipients, sender: gmailUser || 'manual', status: 'COMPOSE_FALLBACK' }
    console.log('📨 LEAK FALLBACK (Gmail Compose):', JSON.stringify(auditLog, null, 2))
    persistLeakedId(caseId)

    return NextResponse.json({
      success: true,
      auditLog,
      message: `SMTP unavailable. Opening Gmail compose window instead.`,
      method: 'compose',
      composeUrl: gmailComposeUrl,
    })

  } catch (err: any) {
    console.error('❌ Leak dispatch failed:', err)
    return NextResponse.json({ error: err.message || 'Failed to process disclosure', success: false }, { status: 500 })
  }
}
