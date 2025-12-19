const PLAN_CONFIG = {
  free: {
    id: 'free',
    name: 'Free',
    priceLabel: '₹0',
    priceAmount: 0,
    tagline: 'Sample one universe',
    description: 'Kick things off with a single platform and weekly swaps.',
    platforms: ['Netflix'],
    features: ['1 platform at a time', '720p streaming', 'Supported with promos']
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    priceLabel: '₹699',
    priceAmount: 699,
    tagline: 'Double the blockbusters',
    description: 'Unlock Disney+ and Prime Video alongside Netflix favorites.',
    platforms: ['Netflix', 'Disney+', 'Prime Video', 'Vidio'],
    features: ['Up to 4 platforms', '1080p streaming', 'Watch on 2 devices']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: '₹1299',
    priceAmount: 1299,
    tagline: 'All-access premiere club',
    description: 'Every platform, UHD streaming, and early-window releases.',
    platforms: ['Netflix', 'Disney+', 'Prime Video', 'Vidio', 'Apple TV+', 'Viu', 'HBO', 'Hulu', 'Paramount+', 'Peacock'],
    features: ['All platforms unlocked', '4K + HDR', 'Offline downloads', 'Priority support']
  }
};

function getPlanConfig(planId) {
  return PLAN_CONFIG[planId] || null;
}

module.exports = { PLAN_CONFIG, getPlanConfig };
