import { API_BASE } from './config';

export type User = {
  id: string;
  name: string;
  age: number;
  gender: 0 | 1;
  location?: string;
  bio?: string;
  avatar?: string;
  photos?: string[];
  // Optional tokens for Cloudinary delete-by-token (unsigned)
  avatarDeleteToken?: string;
  photoDeleteTokens?: string[];
  interests?: string[];
  languages?: string[];
  occupation?: string;
  zodiac?: string;
  religion?: string;
  education?: string;
  height?: number;
  smoking?: string;
  drinking?: string;
  pets?: string;
  children?: string;
  matches?: string[];
  linkedAccounts?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<T>;
}

export function listUsers(): Promise<User[]> {
  return http<User[]>('/user');
}

export function getUser(id: string): Promise<User> {
  return http<User>(`/user/${id}`);
}

export function updateUser(id: string, body: Partial<User>): Promise<User> {
  return http<User>(`/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
