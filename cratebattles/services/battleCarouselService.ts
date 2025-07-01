/* src/components/games/cratebattles/services/battleCarouselService.ts */
import { CrateItem } from './types';

/** helper – pads the reel to at least `minLen` by repeating items */
const padReel = (reel: CrateItem[], minLen = 30) => {
  if (reel.length >= minLen) return reel;
  const padded: CrateItem[] = [];
  let i = 0;
  while (padded.length < minLen) {
    padded.push({ ...reel[i % reel.length] });
    i++;
  }
  return padded;
};

export const startCarouselBattleService = (
  battleData: any,
): CrateItem[] => {
  // get the source list – *crate contents* or *finalItems*
  const source: (CrateItem | null | undefined)[] =
    battleData?.finalItems ??
    battleData?.crates?.[0]?.crate?.contents ??
    [];

  // build the reel, skipping null / undefined entries
  const reel = source
    .filter((i): i is CrateItem => Boolean(i && i.id))
    .map(i => ({
      id: i.id,
      name: i.name,
      image: i.image,
      value: i.value,
      rarity: i.rarity,
      dropChance: i.dropChance,
    }));

  // never return an empty array — pad or fallback
  return padReel(reel.length ? reel : [{
    id: 'empty',
    name: '???',
    image: '/img/unknown.png',
    value: 0,
    rarity: 'common',
    dropChance: 0,
  }]);
};
