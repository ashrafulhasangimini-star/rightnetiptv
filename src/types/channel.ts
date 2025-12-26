export interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
  isLive: boolean;
  viewers: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  channelCount: number;
}

export interface StreamStats {
  totalChannels: number;
  liveChannels: number;
  totalViewers: number;
  categories: number;
}
