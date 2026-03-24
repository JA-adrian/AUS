import { useState, useEffect } from 'react'
import api from '../api'

const PUBLIC_VAPID_KEY = 'BIlKGfJBxo5sS0OOHj5I3KopGjJaBQ_P4GA2l4wb6oGVCeEamXBFlr9Qj-cQuOKaMGgf6v-1sPxHIp4OybZ20jY'

function urlBase64ToUint8Array(base64String) {
  const padding   = '='.repeat((4 - base64String.length % 4) % 4)
  const base64    = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData   = window.atob(base64)
  const outputArr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArr[i] = rawData.charCodeAt(i)
  }
  return outputArr
}

export function usePushNotification() {
  const [status, setStatus] = useState('default')

  useEffect(() => {
    if ('Notification' in window) {
      setStatus(Notification.permission)
    }
  }, [])

  const mintaIzin = async () => {
    try {
      // Cek support
      if (!('serviceWorker' in navigator)) {
        console.log('Browser tidak support Service Worker')
        return
      }
      if (!('PushManager' in window)) {
        console.log('Browser tidak support Push API')
        return
      }

      // Minta izin notifikasi dulu
      const permission = await Notification.requestPermission()
      setStatus(permission)
      if (permission !== 'granted') {
        console.log('Izin ditolak')
        return
      }

      // Unregister service worker lama kalau ada
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const reg of registrations) {
        await reg.unregister()
      }

      // Register ulang service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('Service worker terdaftar:', registration)

      // Tunggu service worker aktif
      await navigator.serviceWorker.ready
      console.log('Service worker aktif!')

      // Subscribe push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      })
      console.log('Subscription:', subscription)

      // Kirim ke backend
      await api.post('/push/subscribe', subscription)
      console.log('Push notification aktif!')

    } catch (err) {
      console.log('Gagal aktifkan push notification:', err)
    }
  }

  return { status, mintaIzin }
}