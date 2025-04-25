// Very simple service worker with minimal features
// This should reduce storage errors

// Skip waiting to become active immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Claim all clients when activated
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Track notifications to prevent duplicates
let lastNotificationTimestamp = 0;
const NOTIFICATION_THRESHOLD_MS = 1000; // 1 second threshold

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received at:', new Date().toISOString());
  
  if (!event.data) {
    console.warn('No data in push event');
    return;
  }
  
  // Check if this is a duplicate notification (received within threshold)
  const now = Date.now();
  if (now - lastNotificationTimestamp < NOTIFICATION_THRESHOLD_MS) {
    console.log('Ignoring duplicate notification (received too quickly)');
    return;
  }
  
  // Update timestamp
  lastNotificationTimestamp = now;
  
  let notificationData;
  try {
    notificationData = event.data.json();
    console.log('Parsed notification data:', notificationData);
  } catch (error) {
    console.error('Error parsing notification data:', error);
    notificationData = {
      title: 'New notification',
      body: 'You have a new notification'
    };
  }
  
  // Show notification with basic options
  const options = {
    body: notificationData.body || 'No message content',
    icon: notificationData.icon || '/1logo_no_bg.png',
    badge: notificationData.badge,
    data: notificationData.data || { url: '/' },
    tag: notificationData.data?.type || 'notification' // Use tag to prevent duplicates
  };
  
  console.log('Showing notification with title:', notificationData.title);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Notification', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();
  
  const url = event.notification.data && event.notification.data.url ? 
    event.notification.data.url : '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
  