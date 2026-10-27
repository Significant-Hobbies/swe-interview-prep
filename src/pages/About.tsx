import publicCopy from '../data/public-copy/about.json';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-200">
      <Link to={publicCopy.links[0]} className="text-xs text-slate-500 hover:text-blue-400">
        {publicCopy.text[0]}
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{publicCopy.text[1]}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">{publicCopy.text[2]}</p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[3]}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          <Link to={publicCopy.links[1]} className="underline">
            {publicCopy.text[4]}
          </Link>{' '}
          {publicCopy.text[5]}
        </li>
        <li>
          <Link to={publicCopy.links[2]} className="underline">
            {publicCopy.text[6]}
          </Link>{' '}
          {publicCopy.text[7]}
        </li>
        <li>
          <Link to={publicCopy.links[3]} className="underline">
            {publicCopy.text[8]}
          </Link>{' '}
          {publicCopy.text[9]}
        </li>
        <li>
          <Link to={publicCopy.links[4]} className="underline">
            {publicCopy.text[10]}
          </Link>{' '}
          {publicCopy.text[11]}
        </li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[12]}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        {publicCopy.text[13]}{' '}
        <code className="rounded bg-slate-800 px-1 text-blue-300">{publicCopy.text[14]}</code>{' '}
        {publicCopy.text[15]}
      </p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">{publicCopy.text[16]}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        {publicCopy.text[17]}{' '}
        <code className="rounded bg-slate-800 px-1 text-blue-300">{publicCopy.text[18]}</code>
        {publicCopy.text[19]}
        <code className="rounded bg-slate-800 px-1 text-blue-300">{publicCopy.text[20]}</code>
        {publicCopy.text[21]}
        <code className="rounded bg-slate-800 px-1 text-blue-300">{publicCopy.text[22]}</code>
        {publicCopy.text[23]}
        <code className="rounded bg-slate-800 px-1 text-blue-300">{publicCopy.text[24]}</code>
        {publicCopy.text[25]}
      </p>

      <h2 className="mt-10 text-base font-semibold text-cyan-400">{publicCopy.text[26]}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        {publicCopy.text[27]} <em>{publicCopy.text[28]}</em>
        {publicCopy.text[29]}
        <strong>{publicCopy.text[30]}</strong>
        {publicCopy.text[31]}
      </p>

      <h3 className="mt-6 text-sm font-semibold text-slate-200">{publicCopy.text[32]}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          <strong>{publicCopy.text[33]}</strong>
          {publicCopy.text[34]}
          <em>{publicCopy.text[35]}</em>
          {publicCopy.text[36]}{' '}
          <a
            href={publicCopy.links[5]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[37]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[38]}</strong>
          {publicCopy.text[39]}
          <em>{publicCopy.text[40]}</em>
          {publicCopy.text[41]}{' '}
          <a
            href={publicCopy.links[6]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[42]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[43]}</strong>
          {publicCopy.text[44]}{' '}
          <a
            href={publicCopy.links[7]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[45]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[46]}</strong>
          {publicCopy.text[47]}
        </li>
        <li>
          <strong>{publicCopy.text[48]}</strong>
          {publicCopy.text[49]}{' '}
          <a
            href={publicCopy.links[8]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[50]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[51]}</strong>
          {publicCopy.text[52]}
        </li>
        <li>
          <strong>{publicCopy.text[53]}</strong>
          {publicCopy.text[54]}
          <em>{publicCopy.text[55]}</em>
          {publicCopy.text[56]}{' '}
          <a
            href={publicCopy.links[9]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[57]}
          </a>
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-slate-200">{publicCopy.text[58]}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          <strong>{publicCopy.text[59]}</strong>
          {publicCopy.text[60]}
          <em>{publicCopy.text[61]}</em>
          {publicCopy.text[62]}{' '}
          <a
            href={publicCopy.links[10]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[63]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[64]}</strong>
          {publicCopy.text[65]}{' '}
          <a
            href={publicCopy.links[11]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[66]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[67]}</strong>
          {publicCopy.text[68]}
        </li>
        <li>
          <strong>{publicCopy.text[69]}</strong>
          {publicCopy.text[70]}
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-slate-200">{publicCopy.text[71]}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">{publicCopy.text[72]}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          <strong>{publicCopy.text[73]}</strong>
          {publicCopy.text[74]}{' '}
          <a
            href={publicCopy.links[12]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[75]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[76]}</strong>
          {publicCopy.text[77]}{' '}
          <a
            href={publicCopy.links[13]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[78]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[79]}</strong>
          {publicCopy.text[80]}{' '}
          <a
            href={publicCopy.links[14]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[81]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[82]}</strong>
          {publicCopy.text[83]}{' '}
          <a
            href={publicCopy.links[15]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[84]}
          </a>
        </li>
        <li>
          <strong>{publicCopy.text[85]}</strong>
          {publicCopy.text[86]}{' '}
          <a
            href={publicCopy.links[16]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {publicCopy.text[87]}
          </a>
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-slate-200">{publicCopy.text[88]}</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
        <li>
          <strong>{publicCopy.text[89]}</strong>
          {publicCopy.text[90]}
        </li>
        <li>
          <strong>{publicCopy.text[91]}</strong>
          {publicCopy.text[92]}
        </li>
        <li>
          <strong>{publicCopy.text[93]}</strong>
          {publicCopy.text[94]}
        </li>
        <li>
          <strong>{publicCopy.text[95]}</strong>
          {publicCopy.text[96]}
        </li>
        <li>
          <strong>{publicCopy.text[97]}</strong>
          {publicCopy.text[98]}
        </li>
        <li>
          <strong>{publicCopy.text[99]}</strong>
          {publicCopy.text[100]}
        </li>
        <li>
          <strong>{publicCopy.text[101]}</strong>
          {publicCopy.text[102]}
        </li>
      </ol>
    </main>
  );
}
