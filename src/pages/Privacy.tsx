import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-slate-300">
      <Link to="/" className="text-xs text-slate-500 hover:text-blue-400">
        ← Loop
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Privacy</h1>
      <p className="mt-4 text-xs text-slate-500">Last updated: 2026-05-15.</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">What we store</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Google identity (id, name, email, avatar) when you sign in.</li>
        <li>Your FSRS state and per-concept mastery snapshots.</li>
        <li>Notes you write in the Playground.</li>
        <li>Daily / weekly AI plan history.</li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">AI provider config</h2>
      <p className="mt-2">
        Your AI <code className="rounded bg-slate-800 px-1 text-blue-300">endpointUrl</code> + key +
        model are stored locally in the browser&apos;s storage. The server has fallback envs for
        development but doesn&apos;t persist your API key. Each AI call goes directly to your
        configured endpoint &mdash; we proxy without retaining the request body.
      </p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">What we don&apos;t</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>No third-party tracking pixels or remarketing tags.</li>
        <li>No selling of progress or mastery data.</li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">Deletion</h2>
      <p className="mt-2">
        Sign out and clear browser storage to wipe local state. Email the maintainer to delete your
        server-side FSRS state and notes.
      </p>
    </main>
  );
}
