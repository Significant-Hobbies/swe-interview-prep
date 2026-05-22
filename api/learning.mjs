// Consolidated handler — Hobby plan caps Vercel at 12 serverless functions.
// Routes via ?action= to keep all learning-loop endpoints in one function.
import activityHandler from '../handlers/activity.mjs';
import artifactsHandler from '../handlers/artifacts.mjs';
import conceptsHandler from '../handlers/concepts.mjs';
import critiqueHandler from '../handlers/critique.mjs';
import dailyHandler from '../handlers/daily.mjs';
import drillsHandler from '../handlers/drills.mjs';
import feynmanHandler from '../handlers/feynman.mjs';
import gapsHandler from '../handlers/gaps.mjs';
import notesHandler from '../handlers/learning-notes.mjs';
import projectsHandler from '../handlers/projects.mjs';
import tagHandler from '../handlers/tag.mjs';
import weeklyHandler from '../handlers/weekly.mjs';

const HANDLERS = {
  activity: activityHandler,
  concepts: conceptsHandler,
  tag: tagHandler,
  feynman: feynmanHandler,
  daily: dailyHandler,
  weekly: weeklyHandler,
  artifacts: artifactsHandler,
  drills: drillsHandler,
  projects: projectsHandler,
  notes: notesHandler,
  gaps: gapsHandler,
  critique: critiqueHandler,
};

export default async function handler(req, res) {
  const action = req.query?.action;
  if (!action || !HANDLERS[action]) {
    return res.status(400).json({
      error: `Unknown action. Expected one of: ${Object.keys(HANDLERS).join(', ')}`,
    });
  }
  return HANDLERS[action](req, res);
}
