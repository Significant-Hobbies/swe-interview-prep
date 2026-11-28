/**
 * Read-only view of the learning record for the signed-in web user. The web
 * app is a window onto what agents record; it is never required for learning.
 */
import * as store from './store.mjs';
import { LearningRecordError } from './schema.mjs';

const PAGE = 30;

const DETAIL_VIEWS = {
  course: (client, userId, id, ctx) => store.getCourse(client, userId, { courseId: id }, ctx),
  session: (client, userId, id) => store.getSession(client, userId, { sessionId: id }),
  resource: (client, userId, id) => store.getResource(client, userId, { resourceId: id }),
  gap: (client, userId, id) => store.getGap(client, userId, { gapId: id }),
};

const LIST_SECTIONS = {
  courses: (client, userId, cursor) => store.listCourses(client, userId, { limit: PAGE, cursor }),
  sessions: (client, userId, cursor) => store.getHistory(client, userId, { limit: PAGE, cursor }),
  resources: (client, userId, cursor) =>
    store.listResources(client, userId, { limit: PAGE, cursor }),
  gaps: (client, userId, cursor) => store.listGaps(client, userId, { limit: PAGE, cursor }),
};

async function overview(client, userId, ctx) {
  const [profile, knowledge, ...pages] = await Promise.all([
    store.getProfile(client, userId),
    store.getKnowledgeState(client, userId, { limit: 50 }, ctx),
    ...Object.values(LIST_SECTIONS).map((load) => load(client, userId, undefined)),
  ]);
  const sections = Object.fromEntries(
    Object.keys(LIST_SECTIONS).map((key, index) => [key, pages[index]])
  );
  return { profile, knowledge, ...sections };
}

function errorStatus(error) {
  return error.code === 'not_found' ? 404 : 400;
}

export async function handleLearningRecordRequest({
  request,
  client,
  user,
  json,
  now = new Date(),
}) {
  const noStore = { 'cache-control': 'private, no-store' };
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: noStore });
  }
  if (!user) return json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'overview';
  const id = url.searchParams.get('id') || '';
  const ctx = { now, userId: user.id };
  try {
    if (DETAIL_VIEWS[view])
      return json(await DETAIL_VIEWS[view](client, user.id, id, ctx), { headers: noStore });
    const section = LIST_SECTIONS[url.searchParams.get('section')];
    if (view === 'list' && section) {
      return json(await section(client, user.id, url.searchParams.get('cursor') || undefined), {
        headers: noStore,
      });
    }
    if (view !== 'overview')
      return json({ error: 'Unknown view' }, { status: 400, headers: noStore });
    return json(await overview(client, user.id, ctx), { headers: noStore });
  } catch (error) {
    if (error instanceof LearningRecordError) {
      return json(
        { error: error.message, code: error.code },
        { status: errorStatus(error), headers: noStore }
      );
    }
    throw error;
  }
}
