
export interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  minBet: number;
  maxBet: number;
  comingSoon?: boolean;
  doubleXP?: boolean;
}

export const games: Game[] = [
  {
    id: 'crate-battles',
    name: 'CRATE BATTLES',
    description: 'Battle with crates and discover amazing rewards!',
    imageUrl: '/lovable-uploads/a39de535-94e1-4e31-941e-48138964331b.png',
    minBet: 5,
    maxBet: 1500,
    comingSoon: false
  },
  {
    id: 'coinflip',
    name: 'COINFLIP',
    description: 'Heads or tails? Double your skins with 50/50 odds.',
    imageUrl: '/lovable-uploads/03626109-4a0d-4567-89fe-823ace9fdb81.png',
    minBet: 1,
    maxBet: 2000,
    doubleXP: true
  },
  {
    id: 'dual',
    name: 'DUAL',
    description: 'Challenge players in head-to-head battles!',
    imageUrl: '/lovable-uploads/ef4bb5e0-7d93-4d00-8a2a-d2c856f958cc.png',
    minBet: 1,
    maxBet: 3000,
    comingSoon: false
  },
  {
    id: 'bandit-wheel',
    name: 'SULFUR WHEEL',
    description: 'Spin the wheel and test your luck!',
    imageUrl: '/lovable-uploads/f20ebdb8-3792-4367-a684-0a6283a6efe5.png',
    minBet: 0.5,
    maxBet: 500
  },
  {
    id: 'plinko',
    name: 'PLINKO',
    description: 'Strategic gameplay with big rewards.',
    imageUrl: '/lovable-uploads/0d317b02-f36f-4b24-a49e-cef757628cca.png',
    minBet: 2,
    maxBet: 800,
    doubleXP: true
  },
  {
    id: 'minefield',
    name: 'MINEFIELD',
    description: 'Navigate the minefield to multiply your winnings.',
    imageUrl: '/lovable-uploads/4aee683f-0ccb-44a5-ba80-37eb1f2ccb9f.png',
    minBet: 1,
    maxBet: 1200
  },
  {
    id: 'jackpot',
    name: 'JACKPOT',
    description: 'Add your skins to the pot and win it all!',
    imageUrl: '/lovable-uploads/07db274a-c962-47ff-80ed-79d69e0d825d.png',
    minBet: 10,
    maxBet: 5000,
    comingSoon: true
  },
  {
    id: 'crash',
    name: 'CRASH',
    description: 'Watch the multiplier rise and cash out before it crashes!',
    imageUrl: '/lovable-uploads/f5b7e033-447c-4430-ba29-c671f5020425.png',
    minBet: 1,
    maxBet: 1000,
    comingSoon: true
  }
];
