import { format, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns';

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function formatMessageTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatChatTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MM/dd/yy');
  }
}

export function formatLastSeen(date: Date): string {
  const minsAgo = differenceInMinutes(new Date(), date);
  const hoursAgo = differenceInHours(new Date(), date);

  if (minsAgo < 1) return 'just now';
  if (minsAgo < 60) return `${minsAgo}m ago`;
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  if (isYesterday(date)) return 'yesterday';
  return format(date, 'MMM d');
}

export function formatCallDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatGroupDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}
