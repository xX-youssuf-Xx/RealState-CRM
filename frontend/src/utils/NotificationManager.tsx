import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import styles from '../components/Sidebar/Sidebar.module.css';

const VAPID_PUBLIC_KEY = 'BDqL0kJ6w2Z9u9G-KLSWezralCagFYeWtOZaLa5K37iC4uNT07AGIIVwbOxKoIKsNm2TzisaRbFcj3-5AdrFlDo'; 

type SWStatus = 'active' | 'inactive' | 'unsupported';

interface NotificationManagerProps {
  isMobile?: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function NotificationManager({ isMobile = false }: NotificationManagerProps) {
  const [swStatus, setSwStatus] = useState<SWStatus>('inactive');

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported in this browser');
      setSwStatus('unsupported');
      return;
    }

    try {
      // Check if service worker is already registered
      const reg = await navigator.serviceWorker.getRegistration('/');
      
      if (!reg) {
        console.log('Service worker not registered yet');
        setSwStatus('inactive');
        return;
      }
      
      console.log('Service worker already registered:', reg);
      
      // Check if we have an existing subscription
      const sub = await reg.pushManager.getSubscription();
      
      if (sub) {
        console.log('Found existing push subscription:', sub);
        setSwStatus('active');
      } else {
        console.log('No push subscription found');
        setSwStatus('inactive');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSwStatus('inactive');
    }
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers are not supported');
      return;
    }

    try {
      // First, request notification permission directly
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        if (permission !== 'granted') {
          console.error('Notification permission denied');
          return;
        }
      }

      // Try to get existing service worker registration first
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        try {
          // If no registration exists, register the service worker
          registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('Service Worker registered successfully:', registration);
        } catch (regError: any) {
          console.error('Error registering service worker:', regError);
          
          // If we get a storage error, try to clear site data and try again
          if (regError.name === 'AbortError' && regError.message.includes('storage')) {
            console.log('Detected storage error, showing alert to user');
            alert('لتفعيل الإشعارات، يرجى مسح ذاكرة التخزين المؤقت للمتصفح ثم إعادة تحميل الصفحة.');
            return;
          }
          throw regError;
        }
      } else {
        console.log('Using existing service worker registration');
      }
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service worker ready');
      
      // Try to get existing subscription first
      let subscription = await registration.pushManager.getSubscription();
      
      // If no subscription exists, create one
      if (!subscription) {
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log('Created new push subscription:', subscription);
        } catch (subscribeError: any) {
          console.error('Error subscribing to push:', subscribeError);
          
          // Show specific error message for storage errors
          if (subscribeError.name === 'AbortError' && subscribeError.message.includes('storage')) {
            alert('لتفعيل الإشعارات، يرجى مسح ذاكرة التخزين المؤقت للمتصفح ثم إعادة تحميل الصفحة.');
            return;
          }
          
          // For other errors, show a generic message
          alert('تعذر تفعيل الإشعارات. يرجى التحقق من إعدادات المتصفح الخاص بك.');
          return;
        }
      } else {
        console.log('Using existing push subscription:', subscription);
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Use the local development endpoint
      const response = await fetch('https://amaar.egypt-tech.com/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }), 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const result = await response.json();
      console.log('Subscription response:', result);
      
      if (result.success) {
        console.log('Subscription successful, welcome notification sent:', result.notificationSent);
        setSwStatus('active');
      } else {
        console.error('Subscription failed:', result.message);
      }
    } catch (error) {
      console.error('Error in notification setup:', error);
      
      // Show alert for any other errors
      alert('حدث خطأ أثناء تفعيل الإشعارات. يرجى المحاولة مرة أخرى لاحقاً.');
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  if (isMobile) {
    // Mobile version
    if (swStatus === 'inactive') {
      return (
        <>
          <span className={styles.mobileIcon}><Bell size={20} /></span>
          <span className={styles.mobileLabel} onClick={subscribeUser}>تفعيل الاشعارات</span>
        </>
      );
    }

    if (swStatus === 'active') {
      return (
        <>
          <span className={styles.mobileIcon}><Bell size={20} /></span>
          <span className={styles.mobileLabel}>الاشعارات مفعلة</span>
        </>
      );
    }

    return null;
  }

  // Desktop version
  if (swStatus === 'inactive') {
    return (
      <div 
        className={styles.navLink} 
        onClick={subscribeUser}
        style={{ cursor: 'pointer' }}
      >
        <span className={styles.icon}><Bell size={20} /></span>
        <span className={styles.label}>تفعيل الاشعارات</span>
      </div>
    );
  }

  if (swStatus === 'active') {
    return (
      <div className={`${styles.navLink} ${styles.navLinkActive}`}>
        <span className={styles.icon}><Bell size={20} /></span>
        <span className={styles.label}>الاشعارات مفعلة</span>
      </div>
    );
  }

  return null; // Don't show anything if unsupported
}
