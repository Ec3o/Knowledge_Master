import { UserData } from '@/types/user';
const API_BASE = `http://localhost:8084`;
const USER_CACHE_KEY = 'user_cache';
const CACHE_EXPIRE_MS = 30 * 60 * 1000;

interface UserCache {
  data: UserData;
  expiresAt: number; // 时间戳
}



export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
  
    return response.json();
  }
  
  export async function getUserInfo(): Promise<UserData> {
    const cachedUser = getCachedUser();
    if (cachedUser) {
      return cachedUser;
    }
    return await fetchUserInfo();
  }
  
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
function getCachedUser(): UserData | null {
    const cacheStr = localStorage.getItem(USER_CACHE_KEY);
    if (!cacheStr) return null;
  
    try {
      const cache: UserCache = JSON.parse(cacheStr);
      if (Date.now() < cache.expiresAt) {
        return cache.data;
      }
      // 缓存过期，清除
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (e) {
      console.error('解析用户缓存失败', e);
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
  }

function cacheUser(user: UserData): void {
    const cache: UserCache = {
      data: user,
      expiresAt: Date.now() + CACHE_EXPIRE_MS,
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache));
  }
export async function fetchUserInfo(): Promise<UserData> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
  
    const response = await fetch(`${API_BASE}/api/user/info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户信息失败');
    }
  
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || '获取用户信息失败');
    }
  
    // 更新缓存
    cacheUser(result.data);
    return result.data;
  }