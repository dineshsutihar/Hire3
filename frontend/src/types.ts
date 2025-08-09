export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  linkedin?: string;
  skills: string[];
  wallet?: string;
  avatarUrl?: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
}
