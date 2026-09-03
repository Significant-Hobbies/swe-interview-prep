/**
 * The pre-React loading shell painted by index.html.
 *
 * It is `position: fixed; inset: 0` and lives outside `#root`, so nothing
 * React renders can be seen until it is gone. Two places take it down: the
 * normal route commit, and the error boundary — a crash used to leave the
 * shell up forever, hiding the error screen behind a loading state.
 */
export function removeLcpShell(): void {
  document.getElementById('lcp-shell')?.remove();
}
