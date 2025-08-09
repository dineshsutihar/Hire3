import { atom, selector } from "recoil";
import type { AuthState, UserProfile } from "../types";

const LS_KEY = "hire3_auth_v1";

function loadInitial(): AuthState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { token: null, user: null, loading: false };
    return { ...JSON.parse(raw), loading: false };
  } catch {
    return { token: null, user: null, loading: false };
  }
}

export const authAtom = atom<AuthState>({
  key: "authAtom",
  default: loadInitial(),
  effects: [
    ({ onSet }) => {
      onSet((val) => {
        const { loading, ...persist } = val;
        localStorage.setItem(LS_KEY, JSON.stringify(persist));
      });
    },
  ],
});

export const isAuthedSelector = selector<boolean>({
  key: "isAuthed",
  get: ({ get }) => !!get(authAtom).token,
});

export const userSelector = selector<UserProfile | null>({
  key: "user",
  get: ({ get }) => get(authAtom).user,
});

export const authActions = {
  login: (set: any, token: string, user: UserProfile) => {
    set(authAtom, (prev: AuthState) => ({ ...prev, token, user }));
  },
  logout: (set: any) => {
    set(authAtom, { token: null, user: null, loading: false });
  },
  updateProfile: (set: any, user: Partial<UserProfile>) => {
    set(authAtom, (prev: AuthState) =>
      prev.user ? { ...prev, user: { ...prev.user, ...user } } : prev
    );
  },
};
