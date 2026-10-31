/**
 * Messaging Gateway for Direct WhatsApp Outreach and Offline SMS Queue
 */

export interface QueuedSMS {
  id: string;
  studentId: string;
  studentName: string;
  recipientPhone: string;
  message: string;
  language: string;
  timestamp: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
}

const SMS_QUEUE_KEY = 'classpulse_sms_queue';

/**
 * Builds a direct WhatsApp click-to-chat URL:
 * https://wa.me/<phone>?text=<encoded_text>
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  // Clean phone number: remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Default to +91 country code if not prefixed
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) cleaned = `91${cleaned}`;
  } else {
    cleaned = cleaned.replace('+', '');
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

/**
 * Saves SMS dispatch to localStorage queue when offline or simulated
 */
export function queueOfflineSMS(payload: {
  studentId: string;
  studentName: string;
  recipientPhone: string;
  message: string;
  language: string;
}): QueuedSMS {
  const queue = getQueuedSMS();
  const item: QueuedSMS = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...payload,
    timestamp: new Date().toISOString(),
    status: 'QUEUED',
  };
  queue.unshift(item);
  localStorage.setItem(SMS_QUEUE_KEY, JSON.stringify(queue));
  return item;
}

/**
 * Retrieves the SMS queue from localStorage
 */
export function getQueuedSMS(): QueuedSMS[] {
  try {
    const raw = localStorage.getItem(SMS_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clears or updates item in queue
 */
export function markSMSAsSent(id: string): void {
  const queue = getQueuedSMS().map((item) =>
    item.id === id ? { ...item, status: 'SENT' as const } : item
  );
  localStorage.setItem(SMS_QUEUE_KEY, JSON.stringify(queue));
}
