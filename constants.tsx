
import { LoreEntry } from './types';

export const SLOT_SYMBOLS = [
  { id: '🎭', name: 'Mask', weight: 10 },
  { id: '⚜️', name: 'Fleur', weight: 8 },
  { id: '💀', name: 'Skull', weight: 6 },
  { id: '🐍', name: 'Serpent', weight: 5 },
  { id: '💎', name: 'Gem', weight: 3 },
  { id: '🌀', name: 'Void', weight: 2 },
  { id: '🔥', name: 'Inferno', weight: 1 },
];

export const APP_THEME = {
  purple: '#bf00ff',
  green: '#39ff14',
  gold: '#ffd700',
  black: '#0a0a0a',
};

export const INITIAL_VENUES = [
  { id: 'v1', name: 'The Iron Jester', lat: 29.9511, lng: -90.0715, tier: 1, active: true, nfcId: 'tag_v1' },
  { id: 'v2', name: 'Neon Bayou', lat: 29.9584, lng: -90.0644, tier: 2, active: true, nfcId: 'tag_v2' },
  { id: 'v3', name: 'Voodoo Circuit', lat: 29.9620, lng: -90.0550, tier: 3, active: true, nfcId: 'tag_v3' },
];

export const INITIAL_LORE: LoreEntry[] = [
  {
    id: 'lore_1',
    title: 'The First Parade',
    content: 'Long before the circuits flickered, New Orleans danced in the dust. The First Parade wasn\'t just a party; it was a pact between the flesh and the future.',
    unlocked: false,
    unlockRequirement: 'Visit your first venue.'
  },
  {
    id: 'lore_2',
    title: 'Jester Glitch',
    content: 'The Iron Jester wasn\'t always a statue. Legend says he was a hacker who successfully uploaded his consciousness into the city\'s power grid during a blackout.',
    unlocked: false,
    unlockRequirement: 'Visit "The Iron Jester".'
  },
  {
    id: 'lore_3',
    title: 'The Serpent\'s Coil',
    content: 'FuX Coins aren\'t just currency; they are compressed data packets containing the residual joy of the revelers. Spend them wisely, for the Serpent is hungry.',
    unlocked: false,
    unlockRequirement: 'Hit a 3-symbol line in the slots.'
  },
  {
    id: 'lore_4',
    title: 'Stealth Protocol 404',
    content: 'In a world of constant surveillance, being invisible is the ultimate luxury. The Safety Core patches were designed to hide the elite, but now they belong to the streets.',
    unlocked: false,
    unlockRequirement: 'Trigger Stealth Mode via NFC.'
  }
];

export const DISCOVER_USERS = [
  { id: 'user_002', displayName: 'Voodoo_Child', avatarUrl: 'https://i.pravatar.cc/150?u=voodoo' },
  { id: 'user_003', displayName: 'Neon_Ghost', avatarUrl: 'https://i.pravatar.cc/150?u=neon' },
  { id: 'user_004', displayName: 'Bead_Hunter', avatarUrl: 'https://i.pravatar.cc/150?u=bead' },
];
