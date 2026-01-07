
import { User, Venue, SlotResult, TagType, NFCScanResponse, LoreEntry } from '../types';
import { SLOT_SYMBOLS, INITIAL_VENUES, INITIAL_LORE, DISCOVER_USERS } from '../constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

class ApiService {
  private user: User = {
    id: 'user_001',
    displayName: 'Cypher_Mardi',
    avatarUrl: 'https://i.pravatar.cc/150?u=cypher',
    fuXBalance: 1000,
    totalFuXEarned: 1000,
    totalVenuesVisited: 0,
    trustScore: 85,
    locationSharing: true,
    ownPatchId: 'patch_404',
    friends: [],
    pendingRequests: ['user_002']
  };

  private venues: Venue[] = INITIAL_VENUES;
  private lore: LoreEntry[] = [...INITIAL_LORE];
  private visitedVenues: Set<string> = new Set();

  getUser() { return { ...this.user }; }

  updateProfile(displayName: string, avatarUrl: string) {
    this.user.displayName = displayName;
    this.user.avatarUrl = avatarUrl;
    return { ...this.user };
  }

  getDiscoverUsers() {
    return DISCOVER_USERS.filter(u => !this.user.friends.includes(u.id) && !this.user.pendingRequests.includes(u.id));
  }

  acceptFriend(userId: string) {
    this.user.pendingRequests = this.user.pendingRequests.filter(id => id !== userId);
    this.user.friends.push(userId);
    return { ...this.user };
  }

  sendRequest(userId: string) {
    // In mock, just "instantly" add them for UX or move to a "sent" list
    this.user.friends.push(userId);
    return { ...this.user };
  }

  getLore() { return [...this.lore]; }

  addLoreEntry(entry: Omit<LoreEntry, 'id'>) {
    const newEntry: LoreEntry = {
      ...entry,
      id: `lore_${Date.now()}`
    };
    this.lore.unshift(newEntry); // Add to top
    return [...this.lore];
  }

  private unlockLore(loreId: string) {
    const entry = this.lore.find(l => l.id === loreId);
    if (entry && !entry.unlocked) {
      entry.unlocked = true;
      return loreId;
    }
    return undefined;
  }

  toggleLocation() {
    this.user.locationSharing = !this.user.locationSharing;
    if (!this.user.locationSharing) {
      this.unlockLore('lore_4');
    }
    
    // Haptic feedback for status change
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Active: one short pulse, Stealth: two short pulses
      navigator.vibrate(this.user.locationSharing ? [100] : [100, 50, 100]);
    }
    
    return this.user.locationSharing;
  }

  getVenues() { return [...this.venues]; }

  async scanNfc(nfcId: string): Promise<NFCScanResponse> {
    if (nfcId === this.user.ownPatchId) {
      const newState = this.toggleLocation();
      const loreId = this.unlockLore('lore_4');
      return {
        type: TagType.PATCH,
        message: `Stealth Mode: ${newState ? 'OFF' : 'ON'}. Visibility ${newState ? 'Broadcasting' : 'Ghosted'}.`,
        loreUnlocked: loreId
      };
    }

    const venue = this.venues.find(v => v.nfcId === nfcId);
    if (venue) {
      const reward = 50 * venue.tier;
      this.user.fuXBalance += reward;
      this.user.totalFuXEarned += reward;
      
      let loreId: string | undefined;
      if (!this.visitedVenues.has(venue.id)) {
        this.visitedVenues.add(venue.id);
        this.user.totalVenuesVisited++;
        loreId = this.unlockLore('lore_1');
        if (venue.id === 'v1') loreId = this.unlockLore('lore_2') || loreId;
      }

      return {
        type: TagType.VENUE,
        message: `Checked into ${venue.name}. Earned ${reward} FuX.`,
        reward,
        loreUnlocked: loreId
      };
    }

    const types = [TagType.REWARD, TagType.CURSE, TagType.BLESSING];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    if (randomType === TagType.REWARD) {
      this.user.fuXBalance += 100;
      this.user.totalFuXEarned += 100;
      return { type: randomType, message: "Found a hidden cache. +100 FuX.", reward: 100 };
    } else if (randomType === TagType.CURSE) {
      this.user.fuXBalance = Math.max(0, this.user.fuXBalance - 50);
      return { type: randomType, message: "A digital hex drains your wallet. -50 FuX.", penalty: 50 };
    }
    
    return { type: TagType.BLESSING, message: "The spirits favor you. Trust score increased." };
  }

  async spinSlots(bet: number): Promise<SlotResult> {
    if (this.user.fuXBalance < bet) throw new Error("Insufficient balance");
    this.user.fuXBalance -= bet;
    
    const grid: string[][] = [];
    for (let r = 0; r < 3; r++) {
      grid[r] = [];
      for (let c = 0; c < 3; c++) {
        const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
        grid[r][c] = symbol.id;
      }
    }

    let winAmount = 0;
    const linesHit: number[] = [];
    grid.forEach((row, idx) => {
      if (row[0] === row[1] && row[1] === row[2]) {
        winAmount += bet * 10;
        linesHit.push(idx);
      }
    });

    this.user.fuXBalance += winAmount;
    this.user.totalFuXEarned += winAmount;

    let loreUnlocked: string | undefined;
    if (linesHit.length > 0) {
      loreUnlocked = this.unlockLore('lore_3');
    }

    let loreMessage = "The reels settle in the neon haze.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, cool, one-sentence "lore" response for a cyberpunk Mardi Gras slot game result. Win amount: ${winAmount}. Symbols: ${grid.flat().join(',')}. Keep it atmospheric.`,
      });
      loreMessage = response.text || loreMessage;
    } catch (e) { console.error(e); }

    return { grid, winAmount, newBalance: this.user.fuXBalance, linesHit, loreMessage, loreUnlocked };
  }
}

export const apiService = new ApiService();
