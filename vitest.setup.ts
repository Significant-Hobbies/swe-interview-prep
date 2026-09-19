type Job = {
  callback: (lock: unknown) => unknown;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
};

const queues = new Map<string, Job[]>();
const active = new Set<string>();
function drain(name: string) {
  if (active.has(name)) return;
  const queue = queues.get(name);
  if (!queue?.length) return;
  active.add(name);
  const { callback, resolve, reject } = queue.shift()!;
  Promise.resolve()
    .then(() => callback({ name, mode: 'exclusive' }))
    .then(resolve, reject)
    .finally(() => {
      active.delete(name);
      drain(name);
    });
}
const locks = {
  request: (name: string, _options: unknown, callback: (lock: unknown) => unknown) =>
    new Promise((resolve, reject) => {
      const queue = queues.get(name) ?? [];
      queue.push({ callback, resolve, reject });
      queues.set(name, queue);
      drain(name);
    }),
};

if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks } });
} else if (!globalThis.navigator.locks) {
  Object.defineProperty(globalThis.navigator, 'locks', { configurable: true, value: locks });
}
