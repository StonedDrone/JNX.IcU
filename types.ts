
export enum TagType {
  PATCH = 'PATCH',
  VENUE = 'VENUE',
  REWARD = 'REWARD',
  CURSE = 'CURSE',
  BLESSING = 'BLESSING'
}

export interface User {
  id: string;
  displayName: string;
  avatarUrl: string;
  fuXBalance: number;
  totalFuXEarned: number;
  totalVenuesVisited: number;
  trustScore: number;
  locationSharing: boolean;
  ownPatchId: string;
  friends: string[]; // IDs of friends
  pendingRequests: string[]; // IDs of users requesting friendship
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
  unlockRequirement: string;
}

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tier: number;
  active: boolean;
  nfcId: string;
}

export interface SlotResult {
  grid: string[][];
  winAmount: number;
  newBalance: number;
  linesHit: number[];
  loreMessage: string;
  loreUnlocked?: string; // ID of lore entry unlocked
}

export interface NFCScanResponse {
  type: TagType;
  message: string;
  reward?: number;
  penalty?: number;
  loreUnlocked?: string;
}
