import publicCopy from '../data/public-copy/privacy.json';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-slate-300">
      <Link to={publicCopy.links[0]} className="text-xs text-slate-500 hover:text-blue-400">
        {publicCopy.text[0]}
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{publicCopy.text[1]}</h1>
      <p className="mt-4 text-xs text-slate-500">{publicCopy.text[2]}</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[3]}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>{publicCopy.text[4]}</li>
        <li>{publicCopy.text[5]}</li>
        <li>{publicCopy.text[6]}</li>
        <li>{publicCopy.text[7]}</li>
        <li>{publicCopy.text[8]}</li>
        <li>{publicCopy.text[9]}</li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[10]}</h2>
      <p className="mt-2">{publicCopy.text[11]}</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[12]}</h2>
      <p className="mt-2">{publicCopy.text[13]}</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[14]}</h2>
      <p className="mt-2">{publicCopy.text[15]}</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[16]}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>{publicCopy.text[17]}</li>
        <li>{publicCopy.text[18]}</li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[19]}</h2>
      <p className="mt-2">{publicCopy.text[20]}</p>
    </main>
  );
}
