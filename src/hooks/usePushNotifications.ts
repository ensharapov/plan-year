import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// VAPID public key will be fetched from edge function
const VAPID_PUBLIC_KEY_STORAGE = 'vapid_public_key';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
  }, []);

  useEffect(() => {
    if (!supported || !user) return;
    // Check existing subscription
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, [supported, user]);

  const getVapidKey = useCallback(async (): Promise<string | null> => {
    // Check local cache
    const cached = localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.functions.invoke('push-vapid-key');
      if (error || !data?.publicKey) return null;
      localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, data.publicKey);
      return data.publicKey;
    } catch {
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || !user) return false;
    setLoading(true);

    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setLoading(false);
        return false;
      }

      // Register push service worker
      const reg = await navigator.serviceWorker.ready;

      // Get VAPID key
      const vapidKey = await getVapidKey();
      if (!vapidKey) {
        console.error('Failed to get VAPID key');
        setLoading(false);
        return false;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save subscription to backend
      const { error } = await supabase.functions.invoke('push-subscribe', {
        body: {
          subscription: subscription.toJSON(),
        },
      });

      if (error) {
        console.error('Failed to save subscription:', error);
        setLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      setLoading(false);
      return false;
    }
  }, [supported, user, getVapidKey]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        // Remove from backend
        await supabase.functions.invoke('push-unsubscribe', {
          body: { endpoint: sub.endpoint },
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    }
    setLoading(false);
  }, [supported]);

  return {
    supported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  };
}
