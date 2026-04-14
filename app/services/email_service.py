"""
email_service.py
────────────────
Non-blocking email sender using threading fallback.
If SMTP fails or hangs, it NEVER blocks the API response.
"""

import aiosmtplib
import logging
import threading
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# SYNC sender (runs in a background thread — NEVER blocks FastAPI)
# ══════════════════════════════════════════════════════════════════════════════
def _send_sync(to_email: str, subject: str, html_body: str) -> bool:
    """
    Synchronous SMTP send using stdlib smtplib.
    Called from a background thread — never blocks the main async loop.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email not configured — skipping send to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.send_message(msg)
        logger.info("✅ Email sent to %s — %s", to_email, subject)
        return True
    except Exception as e:
        logger.error("❌ Email failed to %s: %s", to_email, e)
        return False


def _send_in_background(to_email: str, subject: str, html_body: str):
    """
    Fire-and-forget: spawns a daemon thread to send email.
    The API response returns IMMEDIATELY — email sends in background.
    """
    thread = threading.Thread(
        target=_send_sync,
        args=(to_email, subject, html_body),
        daemon=True,  # dies when main process exits — no zombie threads
    )
    thread.start()
    logger.info("📧 Email queued in background thread for %s", to_email)


# ══════════════════════════════════════════════════════════════════════════════
# ASYNC sender (for use with await — still with timeout protection)
# ══════════════════════════════════════════════════════════════════════════════
async def _send_async(to_email: str, subject: str, html_body: str) -> bool:
    """
    Async SMTP send using aiosmtplib.
    Has a strict 10s timeout — if SMTP hangs, it gives up gracefully.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email not configured — skipping send to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            username=settings.MAIL_USERNAME,
            password=settings.MAIL_PASSWORD,
            start_tls=True,
            timeout=10,
        )
        logger.info("✅ Email sent (async) to %s — %s", to_email, subject)
        return True
    except Exception as e:
        logger.error("❌ Email failed (async) to %s: %s", to_email, e)
        return False


# ══════════════════════════════════════════════════════════════════════════════
# HTML wrapper
# ══════════════════════════════════════════════════════════════════════════════
def _wrap(content: str, preview: str = "") -> str:
    """Wraps content in a dark premium HTML email template."""
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{preview}</title>
</head>
<body style="margin:0;padding:0;background:#03030a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#03030a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#0d0d1a;border:1px solid #1e1e3a;border-radius:20px;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c6aff,#2dffc020);padding:32px 40px 28px;border-bottom:1px solid #1e1e3a;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:22px;font-weight:800;background:linear-gradient(135deg,#a89bff,#2dffc0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px;">⚡SparkX</span></td>
            <td align="right"><span style="font-size:12px;color:#8888aa;font-family:monospace;">Gamified Learning</span></td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          {content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px 28px;border-top:1px solid #1e1e3a;text-align:center;">
          <p style="color:#44445a;font-size:12px;margin:0;">
            You received this because you have an account on SparkX.<br/>
            <span style="color:#8888aa;">© 2024 SparkX · Gamified Learning Tracker</span>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC API — these are called from routers
# All use fire-and-forget threading — API never waits for email
# ══════════════════════════════════════════════════════════════════════════════

def send_welcome_email(to_email: str, name: str):
    """Fire-and-forget welcome email."""
    content = f"""
      <h1 style="color:#f0eeff;font-size:28px;font-weight:700;margin:0 0 8px;">
        Welcome, {name}! 🎉
      </h1>
      <p style="color:#8888aa;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Your journey from zero to job-ready starts now.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        {''.join([
          f'<tr><td style="padding:8px 0;border-bottom:1px solid #1e1e3a;">'
          f'<span style="color:#7c6aff;font-family:monospace;font-size:12px;">0{i+1}</span>'
          f'&nbsp;&nbsp;<span style="color:#f0eeff;font-size:14px;">{lvl}</span>'
          f'</td></tr>'
          for i, lvl in enumerate(["Basics","DSA","Projects","Resume","Interview Prep","Job Apply"])
        ])}
      </table>

      <a href="{settings.FRONTEND_URL}/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#7c6aff,#5a4adf);color:#fff;
                text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
        Start Learning →
      </a>

      <p style="color:#44445a;font-size:13px;margin-top:28px;">
        Complete tasks daily to build your streak 🔥 and climb the leaderboard 🏆
      </p>
    """
    _send_in_background(
        to_email,
        f"Welcome to SparkX, {name}! 🚀",
        _wrap(content, f"Welcome {name}")
    )


def send_reset_password_email(to_email: str, name: str, token: str):
    """Fire-and-forget password reset email."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    content = f"""
      <h1 style="color:#f0eeff;font-size:26px;font-weight:700;margin:0 0 8px;">
        Reset your password 🔐
      </h1>
      <p style="color:#8888aa;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hey {name}, we received a request to reset your password.<br/>
        This link expires in <strong style="color:#f0eeff;">30 minutes</strong>.
      </p>

      <a href="{reset_url}"
         style="display:inline-block;background:linear-gradient(135deg,#7c6aff,#5a4adf);color:#fff;
                text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
        Reset Password →
      </a>

      <div style="margin-top:24px;padding:16px;background:#111127;border:1px solid #1e1e3a;border-radius:12px;">
        <p style="color:#44445a;font-size:12px;margin:0 0 6px;font-family:monospace;">Or paste this link in your browser:</p>
        <p style="color:#7c6aff;font-size:12px;margin:0;word-break:break-all;font-family:monospace;">{reset_url}</p>
      </div>

      <p style="color:#44445a;font-size:13px;margin-top:24px;">
        If you didn't request this, ignore this email — your account is safe.
      </p>
    """
    _send_in_background(
        to_email,
        "Reset your SparkX password",
        _wrap(content, "Password Reset")
    )


def send_streak_broken_email(to_email: str, name: str, lost_streak: int):
    """Fire-and-forget streak broken email."""
    content = f"""
      <h1 style="color:#ff6b35;font-size:26px;font-weight:700;margin:0 0 8px;">
        Your streak broke 😢
      </h1>
      <p style="color:#8888aa;font-size:15px;margin:0 0 20px;line-height:1.6;">
        Hey {name}, your <strong style="color:#f0eeff;">{lost_streak}-day streak</strong> just reset to 0
        because you missed a day of learning.
      </p>

      <div style="padding:20px;background:#ff6b3510;border:1px solid #ff6b3530;border-radius:12px;margin-bottom:24px;text-align:center;">
        <p style="color:#ff6b35;font-size:40px;margin:0;">🔥</p>
        <p style="color:#ff6b35;font-size:18px;font-weight:700;margin:8px 0 0;">
          {lost_streak} day streak lost
        </p>
      </div>

      <p style="color:#8888aa;font-size:14px;margin:0 0 24px;">
        Don't give up! Start a new streak today. Consistency beats perfection — even 1 task per day counts.
      </p>

      <a href="{settings.FRONTEND_URL}/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff4500);color:#fff;
                text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
        Restart Your Streak 🔥
      </a>
    """
    _send_in_background(
        to_email,
        f"Your {lost_streak}-day streak broke — don't stop now!",
        _wrap(content, "Streak Broken")
    )


def send_xp_milestone_email(to_email: str, name: str, xp: int, level_name: str):
    """Fire-and-forget XP milestone email."""
    content = f"""
      <h1 style="color:#f5c842;font-size:26px;font-weight:700;margin:0 0 8px;">
        Level Up! ⚡
      </h1>
      <p style="color:#8888aa;font-size:15px;margin:0 0 20px;">
        Congrats {name}! You've reached a new level.
      </p>

      <div style="padding:24px;background:#f5c84210;border:1px solid #f5c84230;border-radius:16px;margin-bottom:24px;text-align:center;">
        <p style="color:#f5c842;font-size:42px;font-weight:800;margin:0;">{xp:,} XP</p>
        <p style="color:#8888aa;font-size:14px;margin:8px 0 0;">
          Current Level: <strong style="color:#f0eeff;">{level_name}</strong>
        </p>
      </div>

      <a href="{settings.FRONTEND_URL}/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#f5c842,#ff6b35);color:#03030a;
                text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
        View Dashboard →
      </a>
    """
    _send_in_background(
        to_email,
        f"🎉 You reached {level_name} — {xp:,} XP!",
        _wrap(content, "Level Up!")
    )


def send_admin_feedback_email(
    user_name: str, user_email: str, message: str, rating: int
):
    """Fire-and-forget admin notification for new feedback."""
    stars = '⭐' * rating + '☆' * (5 - rating)
    content = f"""
      <h1 style="color:#f0eeff;font-size:26px;font-weight:700;margin:0 0 8px;">
        New Feedback Received 📝
      </h1>
      <p style="color:#8888aa;font-size:15px;margin:0 0 24px;line-height:1.6;">
        A user just submitted feedback on SparkX.
      </p>

      <div style="padding:20px;background:#111127;border:1px solid #1e1e3a;border-radius:12px;margin-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #1e1e3a;">
              <span style="color:#8888aa;font-size:12px;font-family:monospace;">FROM</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #1e1e3a;text-align:right;">
              <span style="color:#f0eeff;font-size:14px;font-weight:600;">{user_name}</span>
              <span style="color:#8888aa;font-size:12px;"> ({user_email})</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #1e1e3a;">
              <span style="color:#8888aa;font-size:12px;font-family:monospace;">RATING</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #1e1e3a;text-align:right;">
              <span style="font-size:16px;">{stars}</span>
              <span style="color:#f5c842;font-size:14px;font-weight:700;"> {rating}/5</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:16px 20px;background:#111127;border:1px solid #1e1e3a;border-radius:12px;">
        <p style="color:#8888aa;font-size:11px;font-family:monospace;margin:0 0 8px;">MESSAGE</p>
        <p style="color:#f0eeff;font-size:14px;line-height:1.7;margin:0;">
          {message}
        </p>
      </div>
    """
    _send_in_background(
        settings.MAIL_FROM,
        f"⭐ New Feedback ({rating}/5) from {user_name}",
        _wrap(content, "New Feedback"),
    )