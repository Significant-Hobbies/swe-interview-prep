/**
 * Daily digest copy — pure functions for cron + preview endpoint.
 */

export function countDueFromMastery(rows, now = new Date()) {
  let due = 0;
  for (const row of rows) {
    if (!row.due) {
      due += 1;
      continue;
    }
    if (new Date(row.due).getTime() <= now.getTime()) due += 1;
  }
  return due;
}

export function buildDigestMessage({
  name,
  dueReviews = 0,
  dueConcepts = 0,
  sessionMinutes = 45,
  horizonDays = null,
  appUrl = 'https://learn.significanthobbies.com',
}) {
  const lines = [];
  if (dueReviews > 0) {
    lines.push(`${dueReviews} review card${dueReviews > 1 ? 's' : ''} due`);
  }
  if (dueConcepts > 0) {
    lines.push(`${dueConcepts} concept${dueConcepts > 1 ? 's' : ''} fading`);
  }
  if (horizonDays != null && horizonDays <= 14) {
    lines.push(`interview in ${horizonDays} days`);
  }

  const headline = lines.length
    ? lines.join(' · ')
    : `Your ${sessionMinutes}-minute session is ready`;

  const subject =
    dueReviews > 0
      ? `Loop: ${dueReviews} review${dueReviews > 1 ? 's' : ''} due today`
      : 'Loop: your study session is ready';

  const text = [
    `Hi ${name || 'there'},`,
    '',
    `${headline}.`,
    '',
    `Open Today: ${appUrl}/today`,
    dueReviews > 0 ? `Reviews: ${appUrl}/practice/all?tab=reviews` : null,
    '',
    'Retrieval beats re-reading.',
    '— Loop',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
<p>Hi ${escapeHtml(name || 'there')},</p>
<p><strong>${escapeHtml(headline)}.</strong></p>
<ul>
  <li><a href="${appUrl}/today">Today's session</a> (${sessionMinutes} min)</li>
  ${dueReviews > 0 ? `<li><a href="${appUrl}/practice/all?tab=reviews">${dueReviews} reviews due</a></li>` : ''}
</ul>
<p style="color:#666;font-size:13px">Retrieval beats re-reading. — Loop</p>`.trim();

  const pushTitle = dueReviews > 0 ? `${dueReviews} reviews due` : 'Session ready';
  const pushBody = headline;

  return { subject, text, html, headline, pushTitle, pushBody };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Profile shape fragment for digest eligibility. */
export function digestEnabled(profile) {
  return Boolean(profile?.digestEmail || profile?.pushEnabled);
}
