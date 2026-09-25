import { db, getSetting, DEFAULT_SETTINGS } from './index';

let isSyncing = false;

export async function syncLogsToCloud(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  if (isSyncing) return { success: false, syncedCount: 0, error: 'Sync already in progress' };
  if (!navigator.onLine) return { success: false, syncedCount: 0, error: 'Offline' };

  const gasUrl = await getSetting('gasUrl', DEFAULT_SETTINGS.gasUrl);
  if (!gasUrl) return { success: false, syncedCount: 0, error: 'No GAS URL configured' };

  isSyncing = true;
  try {
    const pendingLogs = await db.logs.where('syncStatus').equals('pending').toArray();
    if (pendingLogs.length === 0) {
      isSyncing = false;
      return { success: true, syncedCount: 0 };
    }

    let syncedCount = 0;
    for (const log of pendingLogs) {
      try {
        // GAS endpoint format
        const payload = {
          action: 'addLog',
          id: log.id,
          date: log.date,
          time: log.time,
          type: log.type,
          category: log.category,
          amount: log.amount || '',
          note: log.note || '',
          caregiver: log.caregiver,
          bpSys: log.bpSys || '',
          bpDia: log.bpDia || '',
          bpHr: log.bpHr || '',
          stoolStatus: log.stoolStatus || '',
          urineColor: log.urineColor || ''
        };

        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          await db.logs.update(log.id, {
            syncStatus: 'synced',
            syncedAt: Date.now()
          });
          syncedCount++;
        } else {
          await db.logs.update(log.id, {
            syncStatus: 'failed',
            syncError: `HTTP ${res.status}`
          });
        }
      } catch (err: any) {
        await db.logs.update(log.id, {
          syncStatus: 'failed',
          syncError: err?.message || 'Network error'
        });
      }
    }

    isSyncing = false;
    return { success: true, syncedCount };
  } catch (error: any) {
    isSyncing = false;
    return { success: false, syncedCount: 0, error: error?.message || 'Sync failed' };
  }
}

// 註冊網路恢復時自動觸發同步
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncLogsToCloud();
  });
}
