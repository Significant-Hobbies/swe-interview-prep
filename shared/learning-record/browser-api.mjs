/**
 * Read-only view of the learning record for the signed-in web user. The web
 * app is a window onto what agents record; it is never required for learning.
 */
import * as store from './store.mjs';
import { LearningRecordError } from './schema.mjs';

export async function handleLearningRecordRequest({
  request,
  client,
  user,
  json,
  now = new Date(),
}) {
  const noStore = { 'cache-control': 'private, no-store' };
  if (request.method !== 'GET')
    return json({ error: 'Method not allowed' }, { status: 405, headers: noStore });
  if (!user) return json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const url = new URL(request.url);
  const view = url.searchParams.get('view') ?? 'overview';
  const id = url.searchParams.get('id') ?? '';
  const ctx = { now, userId: user.id };
  try {
    if (view === 'course')
      return json(await store.getCourse(client, user.id, { courseId: id }, ctx), {
        headers: noStore,
      });
    if (view === 'session')
      return json(await store.getSession(client, user.id, { sessionId: id }), { headers: noStore });
    if (view === 'resource')
      return json(await store.getResource(client, user.id, { resourceId: id }), {
        headers: noStore,
      });
    if (view !== 'overview')
      return json({ error: 'Unknown view' }, { status: 400, headers: noStore });
    const [profile, knowledge, courses, sessions, resources, gaps] = await Promise.all([
      store.getProfile(client, user.id),
      store.getKnowledgeState(client, user.id, { limit: 50 }, ctx),
      store.listCourses(client, user.id, { limit: 50 }),
      store.getHistory(client, user.id, { limit: 30 }),
      store.listResources(client, user.id, { limit: 30 }),
      store.listGaps(client, user.id, { limit: 20 }),
    ]);
    return json(
      {
        profile,
        knowledge,
        courses: courses.items,
        sessions: sessions.items,
        resources: resources.items,
        gaps: gaps.items,
      },
      { headers: noStore }
    );
  } catch (error) {
    if (error instanceof LearningRecordError) {
      return json(
        { error: error.message, code: error.code },
        { status: error.code === 'not_found' ? 404 : 400, headers: noStore }
      );
    }
    throw error;
  }
}
