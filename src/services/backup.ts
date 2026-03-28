/**
 * 用户数据备份服务
 * 负责将 localStorage 数据导出为 JSON 格式，为后续云端备份做准备
 */

export interface UserDataBackup {
  version: string;
  timestamp: number;
  deviceId: string;
  data: {
    context: string | null;
    userStats: string | null;
    history: string | null;
    studyRecords: string | null;
    practiceRecords: string | null;
  };
  metadata: {
    userAgent: string;
    url: string;
  };
}

// 生成设备唯一标识
function getDeviceId(): string {
  const storageKey = 'saodiseng_device_id';
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
}

/**
 * 导出用户数据为 JSON 格式
 * @returns UserDataBackup 对象，包含所有 localStorage 数据
 */
export function exportUserData(): UserDataBackup {
  const backup: UserDataBackup = {
    version: '1.0.0',
    timestamp: Date.now(),
    deviceId: getDeviceId(),
    data: {
      context: localStorage.getItem('saodiseng_context'),
      userStats: localStorage.getItem('saodiseng_user_stats'),
      history: localStorage.getItem('management_history'),
      studyRecords: localStorage.getItem('saodiseng_study_records'),
      practiceRecords: localStorage.getItem('saodiseng_practice_records'),
    },
    metadata: {
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  };

  return backup;
}

/**
 * 将备份数据转换为 JSON 字符串
 * @param backup UserDataBackup 对象
 * @returns JSON 字符串
 */
export function backupToJson(backup: UserDataBackup): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * 下载备份文件到本地（备用方案）
 * @param backup UserDataBackup 对象
 */
export function downloadBackup(backup: UserDataBackup): void {
  const jsonStr = backupToJson(backup);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `saodiseng_backup_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 执行完整备份流程
 * 1. 收集数据
 * 2. （未来）上传到云端
 * 3. 记录最后备份时间
 */
export function backupUserData(): UserDataBackup | null {
  try {
    const backup = exportUserData();
    
    // 检查是否有数据需要备份
    const hasData = Object.values(backup.data).some(value => value !== null);
    if (!hasData) {
      console.log('[Backup] No data to backup');
      return null;
    }

    // 记录最后备份时间
    localStorage.setItem('saodiseng_last_backup', backup.timestamp.toString());
    
    console.log('[Backup] Data exported successfully:', {
      timestamp: new Date(backup.timestamp).toLocaleString(),
      deviceId: backup.deviceId,
      dataKeys: Object.keys(backup.data).filter(k => backup.data[k as keyof typeof backup.data] !== null),
    });

    // TODO: 未来接入云端存储（Cloudflare D1 或 Supabase）
    // await uploadToCloud(backup);

    return backup;
  } catch (error) {
    console.error('[Backup] Failed to backup user data:', error);
    return null;
  }
}

/**
 * 获取最后备份时间
 * @returns 时间戳，如果没有备份过返回 null
 */
export function getLastBackupTime(): number | null {
  const lastBackup = localStorage.getItem('saodiseng_last_backup');
  return lastBackup ? parseInt(lastBackup, 10) : null;
}

/**
 * 检查是否需要备份（距离上次备份超过24小时）
 * @returns boolean
 */
export function shouldBackup(): boolean {
  const lastBackup = getLastBackupTime();
  if (!lastBackup) return true;
  
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Date.now() - lastBackup > oneDayMs;
}

/**
 * 从备份数据恢复（用于多设备切换场景）
 * @param backup UserDataBackup 对象
 * @returns boolean 是否恢复成功
 */
export function restoreFromBackup(backup: UserDataBackup): boolean {
  try {
    if (backup.data.context) {
      localStorage.setItem('saodiseng_context', backup.data.context);
    }
    if (backup.data.userStats) {
      localStorage.setItem('saodiseng_user_stats', backup.data.userStats);
    }
    if (backup.data.history) {
      localStorage.setItem('management_history', backup.data.history);
    }
    if (backup.data.studyRecords) {
      localStorage.setItem('saodiseng_study_records', backup.data.studyRecords);
    }
    if (backup.data.practiceRecords) {
      localStorage.setItem('saodiseng_practice_records', backup.data.practiceRecords);
    }
    
    console.log('[Backup] Data restored successfully from:', new Date(backup.timestamp).toLocaleString());
    return true;
  } catch (error) {
    console.error('[Backup] Failed to restore data:', error);
    return false;
  }
}

/**
 * 检查云端是否有备份（预留接口，待实现）
 * @returns Promise<UserDataBackup | null> 云端备份或 null
 */
export async function checkCloudBackup(): Promise<UserDataBackup | null> {
  // TODO: 实现云端备份检查逻辑
  // 1. 调用 Cloudflare D1 或 Supabase API
  // 2. 比较本地和云端备份时间戳
  // 3. 返回较新的备份数据
  
  console.log('[Backup] Cloud backup check not implemented yet');
  return null;
}
