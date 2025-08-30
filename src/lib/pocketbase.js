import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

// 数据库表名常量
export const TABLES = {
  MEMOS: 'memos',
  USER_SETTINGS: 'user_settings',
  USERS: 'users',
};

class PocketBaseService {
  // 获取当前用户
  getCurrentUser() {
    return pb.authStore.model;
  }

  // 监听认证状态变化
  onAuthChange(callback) {
    return pb.authStore.onChange(callback);
  }

  // 邮箱登录
  async signInWithEmail(email, password) {
    return await pb.collection(TABLES.USERS).authWithPassword(email, password);
  }

  // OAuth2 登录
  async signInWithOAuth(provider) {
    return await pb.collection(TABLES.USERS).authWithOAuth2({ provider });
  }

  // 登出
  signOut() {
    pb.authStore.clear();
  }

  // 插入或更新 memo
  async upsertMemo(userId, memo) {
    const data = {
      memo_id: memo.id,
      user: userId,
      content: memo.content,
      tags: memo.tags || [],
      backlinks: memo.backlinks || [],
      created_at: memo.createdAt || memo.timestamp,
      updated_at: memo.updatedAt || memo.lastModified || memo.timestamp,
    };

    try {
      // 尝试通过 memo_id 查找记录
      const record = await pb.collection(TABLES.MEMOS).getFirstListItem(`memo_id="${memo.id}"`);
      return await pb.collection(TABLES.MEMOS).update(record.id, data);
    } catch (error) {
      // 如果记录不存在 (getFirstListItem 会抛出 404 错误), 则创建新记录
      if (error.status === 404) {
        return await pb.collection(TABLES.MEMOS).create(data);
      }
      throw error;
    }
  }

  // 插入或更新用户设置
  async upsertUserSettings(userId, settings) {
    const data = {
      user: userId,
      pinned_memos: settings.pinnedMemos,
      theme_color: settings.themeColor,
      dark_mode: String(settings.darkMode) === 'true',
      hitokoto_config: settings.hitokotoConfig,
      font_config: settings.fontConfig,
      background_config: settings.backgroundConfig,
      avatar_config: settings.avatarConfig,
      canvas_config: settings.canvasConfig,
      music_config: settings.musicConfig,
      s3_config: settings.s3Config,
    };

    try {
      const record = await pb.collection(TABLES.USER_SETTINGS).getFirstListItem(`user="${userId}"`);
      return await pb.collection(TABLES.USER_SETTINGS).update(record.id, data);
    } catch (error) {
      if (error.status === 404) {
        return await pb.collection(TABLES.USER_SETTINGS).create(data);
      }
      throw error;
    }
  }

  // 删除 memo
  async deleteMemo(memoId) {
    const record = await pb.collection(TABLES.MEMOS).getFirstListItem(`memo_id="${memoId}"`);
    return await pb.collection(TABLES.MEMOS).delete(record.id);
  }

  // 获取用户的所有 memos
  async getUserMemos(userId) {
    return await pb.collection(TABLES.MEMOS).getFullList({
      filter: `user="${userId}"`,
      sort: '-created_at',
    });
  }

  // 获取用户设置
  async getUserSettings(userId) {
    try {
      return await pb.collection(TABLES.USER_SETTINGS).getFirstListItem(`user="${userId}"`);
    } catch (error) {
      if (error.status === 404) {
        return null; // 如果找不到设置，则返回 null
      }
      throw error;
    }
  }

  // 同步用户数据
  async syncUserData(userId) {
    const localData = {
        memos: JSON.parse(localStorage.getItem('memos') || '[]'),
        pinnedMemos: JSON.parse(localStorage.getItem('pinnedMemos') || '[]'),
        themeColor: localStorage.getItem('themeColor') || '#818CF8',
        darkMode: localStorage.getItem('darkMode') || 'false',
        hitokotoConfig: JSON.parse(localStorage.getItem('hitokotoConfig') || '{"enabled":true,"types":["a","b","c","d","i","j","k"]}'),
        fontConfig: JSON.parse(localStorage.getItem('fontConfig') || '{"selectedFont":"default"}'),
        backgroundConfig: JSON.parse(localStorage.getItem('backgroundConfig') || '{"imageUrl":"","brightness":50,"blur":10,"useRandom":false}'),
        avatarConfig: JSON.parse(localStorage.getItem('avatarConfig') || '{"imageUrl":""}'),
        canvasConfig: JSON.parse(localStorage.getItem('canvasState') || 'null'),
        musicConfig: JSON.parse(localStorage.getItem('musicConfig') || '{"enabled":true,"customSongs":[]}'),
        s3Config: JSON.parse(localStorage.getItem('s3Config') || '{"enabled":false,"endpoint":"","accessKeyId":"","secretAccessKey":"","bucket":"","region":"auto","publicUrl":"","provider":"r2"}')
    };

    for (const memo of localData.memos) {
      await this.upsertMemo(userId, memo);
    }

    await this.upsertUserSettings(userId, {
        pinnedMemos: localData.pinnedMemos,
        themeColor: localData.themeColor,
        darkMode: localData.darkMode,
        hitokotoConfig: localData.hitokotoConfig,
        fontConfig: localData.fontConfig,
        backgroundConfig: localData.backgroundConfig,
        avatarConfig: localData.avatarConfig,
        canvasConfig: localData.canvasConfig,
        musicConfig: localData.musicConfig,
        s3Config: localData.s3Config,
    });

    return { success: true };
  }

  // 恢复用户数据
  async restoreUserData(userId) {
    const memos = await this.getUserMemos(userId);
    const settings = await this.getUserSettings(userId);

    if (memos) {
        const localMemos = memos.map(memo => ({
          id: memo.memo_id,
          content: memo.content,
          tags: memo.tags || [],
          backlinks: memo.backlinks || [],
          timestamp: memo.created_at,
          lastModified: memo.updated_at,
          createdAt: memo.created_at,
          updatedAt: memo.updated_at
        }));
        localStorage.setItem('memos', JSON.stringify(localMemos));
    }

    if (settings) {
        if (settings.pinned_memos) {
          localStorage.setItem('pinnedMemos', JSON.stringify(settings.pinned_memos));
        }
        if (settings.theme_color) {
          localStorage.setItem('themeColor', settings.theme_color);
        }
        if (settings.dark_mode) {
          localStorage.setItem('darkMode', String(settings.dark_mode));
        }
        if (settings.hitokoto_config) {
          localStorage.setItem('hitokotoConfig', JSON.stringify(settings.hitokoto_config));
        }
        if (settings.font_config) {
          localStorage.setItem('fontConfig', JSON.stringify(settings.font_config));
        }
        if (settings.background_config) {
          localStorage.setItem('backgroundConfig', JSON.stringify(settings.background_config));
        }
        if (settings.avatar_config) {
          localStorage.setItem('avatarConfig', JSON.stringify(settings.avatar_config));
        }
        if (settings.canvas_config) {
          localStorage.setItem('canvasState', JSON.stringify(settings.canvas_config));
        }
        if (settings.music_config) {
          localStorage.setItem('musicConfig', JSON.stringify(settings.music_config));
        }
        if (settings.s3_config) {
          localStorage.setItem('s3Config', JSON.stringify(settings.s3_config));
        }
    }

    return { success: true };
  }
}

export const pocketBaseService = new PocketBaseService();