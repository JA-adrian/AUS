self.addEventListener('push', function(event) {
  const data = event.data.json()

  const options = {
    body: data.pesan,
    icon: '/aus.png',
    badge: '/aus.png',
    vibrate: [200, 100, 200],
    data: { waktu: data.waktu },
    actions: [
      { action: 'buka', title: 'Buka Dashboard' },
      { action: 'tutup', title: 'Tutup' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.judul, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'buka') {
    event.waitUntil(clients.openWindow('/'))
  }
})