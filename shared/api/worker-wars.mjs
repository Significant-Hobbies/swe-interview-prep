import { WarsRepository } from '../software-wars/repository.mjs';
import { failure, isWarMode, success } from '../software-wars/contracts.mjs';

const NO_STORE = { 'cache-control': 'private, no-store' };

function statusForError(error) {
  switch (error?.code) {
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'bad_request':
      return 400;
    case 'late':
      return 409;
    case 'ranked_disabled':
    case 'disabled':
    case 'opponent_unavailable':
    case 'realtime_unavailable':
      return 503;
    case 'not_found':
      return 404;
    default:
      return 500;
  }
}

function methodNotAllowed(json) {
  return json(failure('method_not_allowed', 'Method not allowed'), { status: 405 });
}

function unauthorized(json) {
  return json(failure('unauthorized', 'Sign in to continue'), { status: 401 });
}

export async function dispatchWarsRequest({ request, path, client, user, env, json }) {
  const repository = new WarsRepository(client, { env });
  const segments = path.split('/').filter(Boolean);
  const route = segments.slice(1);

  try {
    if (route[0] === 'provider' && route[1] === 'realtimekit' && route[2] === 'webhook') {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.ingestRealtimeKitWebhook(request)), { status: 202 });
    }

    if (route[0] === 'status') {
      if (request.method !== 'GET') return methodNotAllowed(json);
      return json(success(repository.launchStatus()), {
        headers: { 'cache-control': 'public, max-age=60' },
      });
    }

    if (route[0] === 'curriculum') {
      if (request.method !== 'GET') return methodNotAllowed(json);
      return json(success(repository.curriculumCoverage()), {
        headers: { 'cache-control': 'public, max-age=60' },
      });
    }

    if (route[0] === 'leaderboard' && route[1]) {
      if (request.method !== 'GET') return methodNotAllowed(json);
      if (!isWarMode(route[1])) {
        return json(failure('bad_request', 'Unknown leaderboard mode'), { status: 400 });
      }
      const limit = new URL(request.url).searchParams.get('limit');
      return json(success(await repository.leaderboard(route[1], limit)), {
        headers: { 'cache-control': 'public, max-age=30' },
      });
    }

    if (route[0] === 'results' && route[1] && !route[2]) {
      if (request.method !== 'GET') return methodNotAllowed(json);
      const result = await repository.publicResult(route[1]);
      if (!result) return json(failure('not_found', 'Result not found'), { status: 404 });
      return json(success(result), { headers: { 'cache-control': 'public, max-age=60' } });
    }

    if (route[0] === 'challenges' && route[1] && request.method === 'GET') {
      const challenge = await repository.challengePreview(route[1]);
      if (!challenge) return json(failure('not_found', 'Challenge not found'), { status: 404 });
      return json(success(challenge), { headers: { 'cache-control': 'public, max-age=30' } });
    }

    if (!user) return unauthorized(json);

    if (route[0] === 'ratings' && route.length === 1) {
      if (request.method !== 'GET') return methodNotAllowed(json);
      return json(success(await repository.ratingsForUser(user.id)), { headers: NO_STORE });
    }

    if (route[0] === 'ratings' && route[1] && route[2] === 'visibility') {
      if (request.method !== 'PATCH') return methodNotAllowed(json);
      const body = await request.json();
      return json(
        success(await repository.setLeaderboardVisibility(user.id, route[1], body.visible)),
        { headers: NO_STORE }
      );
    }

    if (route[0] === 'history' && route.length === 1) {
      if (request.method !== 'GET') return methodNotAllowed(json);
      const limit = new URL(request.url).searchParams.get('limit');
      return json(success(await repository.history(user.id, limit)), { headers: NO_STORE });
    }

    if (route[0] === 'blitz' && route[1] === 'matches' && route.length === 2) {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.createBlitzMatch(user, await request.json())), {
        status: 201,
        headers: NO_STORE,
      });
    }

    if (route[0] === 'blitz' && route[1] === 'matches' && route[2]) {
      const matchId = route[2];
      if (route.length === 3 && request.method === 'GET') {
        return json(success(await repository.resumeBlitzMatch(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'answers' && request.method === 'POST') {
        return json(
          success(await repository.submitBlitzAnswer(user.id, matchId, await request.json())),
          {
            headers: NO_STORE,
          }
        );
      }
      if (route[3] === 'finalize' && request.method === 'POST') {
        return json(success(await repository.finalizeBlitzMatch(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'result' && request.method === 'GET') {
        return json(success(await repository.privateResult(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'share' && request.method === 'POST') {
        const body = await request.json();
        return json(
          success(await repository.setResultVisibility(user.id, matchId, body.visibility)),
          {
            headers: NO_STORE,
          }
        );
      }
      if (route[3] === 'reports' && request.method === 'POST') {
        return json(
          success(await repository.submitReport(user.id, matchId, await request.json())),
          {
            status: 202,
            headers: NO_STORE,
          }
        );
      }
      return methodNotAllowed(json);
    }

    if (route[0] === 'tradeoff' && route[1] === 'matches' && route.length === 2) {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.scheduleTradeoff(user, await request.json())), {
        status: 201,
        headers: NO_STORE,
      });
    }

    if (route[0] === 'tradeoff' && route[1] === 'matches' && route[2]) {
      const matchId = route[2];
      if (route.length === 3 && request.method === 'GET') {
        return json(success(await repository.tradeoffRoom(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'check-in' && request.method === 'POST') {
        return json(success(await repository.checkInTradeoff(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'media-token' && request.method === 'POST') {
        return json(success(await repository.mediaAccess(user.id, matchId)), { headers: NO_STORE });
      }
      if (route[3] === 'transcript-consent' && request.method === 'POST') {
        const body = await request.json();
        return json(
          success(await repository.setTranscriptConsent(user.id, matchId, Boolean(body.consent))),
          {
            headers: NO_STORE,
          }
        );
      }
      if (route[3] === 'result' && request.method === 'GET') {
        return json(success(await repository.tradeoffResult(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'share' && request.method === 'POST') {
        const body = await request.json();
        return json(
          success(await repository.setResultVisibility(user.id, matchId, body.visibility)),
          { headers: NO_STORE }
        );
      }
      if (route[3] === 'reports' && request.method === 'POST') {
        return json(
          success(await repository.submitReport(user.id, matchId, await request.json())),
          { status: 202, headers: NO_STORE }
        );
      }
      if (route[3] === 'artifacts' && request.method === 'GET') {
        return json(success(await repository.tradeoffArtifacts(user.id, matchId)), {
          headers: NO_STORE,
        });
      }
      if (route[3] === 'artifacts' && request.method === 'POST') {
        return json(
          success(await repository.saveTradeoffArtifact(user.id, matchId, await request.json())),
          {
            status: 201,
            headers: NO_STORE,
          }
        );
      }
      return methodNotAllowed(json);
    }

    if (route[0] === 'challenges' && route.length === 1) {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.createChallenge(user.id, await request.json())), {
        status: 201,
        headers: NO_STORE,
      });
    }

    if (route[0] === 'challenges' && route[1] && route[2] === 'accept' && route.length === 3) {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.acceptChallenge(user, route[1], await request.json())), {
        status: 201,
        headers: NO_STORE,
      });
    }

    if (route[0] === 'operator' && route[1] === 'rating-corrections') {
      if (request.method !== 'POST') return methodNotAllowed(json);
      return json(success(await repository.correctRating(user, await request.json())), {
        status: 201,
        headers: NO_STORE,
      });
    }

    return json(failure('not_found', 'Wars API route not found'), { status: 404 });
  } catch (error) {
    const status = statusForError(error);
    if (status === 500) console.error('Software Wars request failed', path, error);
    return json(
      failure(
        error?.code ?? 'internal_error',
        status === 500 ? 'Something went wrong. Please try again.' : error.message
      ),
      { status, headers: NO_STORE }
    );
  }
}
