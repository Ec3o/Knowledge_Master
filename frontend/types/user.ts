export interface UserData {
  id: string
  username: string
  email: string
  avatar_uri?: string
  created_at: string
  updated_at: string
}

export interface UserProfile{
  id: string
  email: string
  username: string
  description: string
  website: string
  avatar_uri: string
}