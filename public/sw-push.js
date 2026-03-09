// Custom push notification handler for Навигатор Состояний
self.addEventListener('push', (event) => {
  const defaultData = {
    title: '🔮 Навигатор Состояний',
    body: 'Твоя энергия ждёт тебя',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'navigator-push',
    data: { url: '/dashboard' },
  };

  let data = defaultData;
  try {
    if (event.data) {
      data = { ...defaultData, ...event.data.json() };
    }
  } catch (e) {
    // fallback to default
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '🚀 Открыть' },
        { action: 'dismiss', title: 'Позже' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
