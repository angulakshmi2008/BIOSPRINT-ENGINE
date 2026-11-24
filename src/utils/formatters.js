// Utility formatters for BioSprint Engine

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getStatusColorClass(status) {
  const norm = String(status).toLowerCase();
  switch (norm) {
    case 'active':
    case 'in progress':
    case 'running':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'completed':
    case 'validated':
    case 'available':
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
    case 'in assay':
    case 'draft':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'on hold':
    case 'quarantined':
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'archived':
    case 'depleted':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
