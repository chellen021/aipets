export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    USER_INFO: '/auth/userinfo',
    BIND_PHONE: '/auth/bind-phone'
  },
  PET: {
    GENERATE: '/pet/generate',
    LIST: '/pet/list',
    DETAIL: '/pet/:id',
    INTERACT: '/pet/:id/interact',
    FEED: '/pet/:id/feed',
    CLEAN: '/pet/:id/clean',
    PLAY: '/pet/:id/play',
    TRAIN: '/pet/:id/train',
    STATUS: '/pet/:id/status'
  },
  CHECKIN: {
    STATUS: '/checkin/status',
    DAILY: '/checkin/daily',
    HISTORY: '/checkin/history',
    REWARDS: '/checkin/rewards'
  },
  MALL: {
    PRODUCTS: '/mall/products',
    PRODUCT_DETAIL: '/mall/products/:id',
    PURCHASE: '/mall/purchase',
    ORDERS: '/mall/orders',
    CATEGORIES: '/mall/categories'
  }
}

export const PET_INTERACTIONS = {
  FEED: 'feed',
  PET: 'pet',
  PLAY: 'play',
  CLEAN: 'clean',
  TRAIN: 'train'
}

export const PET_STATUS = {
  MOOD: 'mood',
  HUNGER: 'hunger',
  CLEANLINESS: 'cleanliness',
  AFFECTION: 'affection',
  EXPERIENCE: 'experience',
  LEVEL: 'level'
}

export const INTERACTION_COOLDOWNS = {
  [PET_INTERACTIONS.FEED]: 3600,
  [PET_INTERACTIONS.PET]: 1800,
  [PET_INTERACTIONS.PLAY]: 7200,
  [PET_INTERACTIONS.CLEAN]: 14400,
  [PET_INTERACTIONS.TRAIN]: 21600
}

export const STATUS_DECAY_RATES = {
  [PET_STATUS.MOOD]: 1,
  [PET_STATUS.HUNGER]: 2,
  [PET_STATUS.CLEANLINESS]: 1,
  [PET_STATUS.AFFECTION]: 0.5
}

export const CHECKIN_REWARDS = {
  DAILY: 10,
  STREAK_BONUS: {
    7: 20,
    14: 50,
    30: 100
  }
}

export const MALL_CATEGORIES = {
  FOOD: 'food',
  TOYS: 'toys',
  ACCESSORIES: 'accessories',
  SPECIAL: 'special'
}

export const USER_LEVELS = [
  { level: 1, expRequired: 0 },
  { level: 2, expRequired: 100 },
  { level: 3, expRequired: 250 },
  { level: 4, expRequired: 500 },
  { level: 5, expRequired: 1000 },
  { level: 6, expRequired: 2000 },
  { level: 7, expRequired: 4000 },
  { level: 8, expRequired: 8000 },
  { level: 9, expRequired: 16000 },
  { level: 10, expRequired: 32000 }
]
