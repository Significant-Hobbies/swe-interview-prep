/* Loop — minimal service worker for digest push notifications */
self.addEventListener('push', (event) => {
  let data = { title: 'Loop', body: 'Your session is ready', url: '/today' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // plain text fallback
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      data: { url: data.url || '/today' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/today';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});