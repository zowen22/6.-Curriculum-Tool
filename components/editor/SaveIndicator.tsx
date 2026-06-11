import type { SaveStatus } from '@/types/curriculum'

export default function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const styles: Record<Exclude<SaveStatus, 'idle'>, string> = {
    saving: 'text-gray-400',
    saved: 'text-green-600',
    error: 'text-red-500',
  }
  const labels: Record<Exclude<SaveStatus, 'idle'>, string> = {
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Error saving',
  }
  return <span className={`text-xs ${styles[status]}`}>{labels[status]}</span>
}
