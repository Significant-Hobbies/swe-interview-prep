import './index.css';

// The existing inline learning shell can paint before React commits.
if (window.location.pathname === '/') void import('./pages/Home').catch(() => {});
void import('./bootstrap').catch(() => {
  document.getElementById('lcp-shell')?.remove();
  const root = document.getElementById('root');
  if (!root) return;
  root.removeAttribute('data-public-prerender');
  const main = document.createElement('main');
  main.style.cssText =
    'margin:64px auto;padding:24px;max-width:800px;color:white;font-family:system-ui,sans-serif';
  const title = document.createElement('h1');
  title.textContent = 'SWE Interview Prep';
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'Could not open the learning workspace.';
  const retry = document.createElement('button');
  retry.textContent = 'Try again';
  retry.addEventListener('click', () => window.location.reload());
  main.append(title, message, retry);
  root.replaceChildren(main);
});
