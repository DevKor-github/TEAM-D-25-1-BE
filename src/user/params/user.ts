export interface CreateUserParam {
  email: string;
  username: string;
  nickname?: string;
  password?: string;
  socialProvider?: string;
  socialId?: string;
  isPrivate?: boolean;
}

export interface UpdateUserParam {
  email?: string;
  username?: string;
  nickname?: string;
  password?: string;
  socialProvider?: string;
  socialId?: string;
  isPrivate?: boolean;
}

export interface UserParam {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  password?: string;
  socialProvider?: string;
  socialId?: string;
  isPrivate: boolean;
  createdAt: Date;
}
