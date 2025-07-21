
interface PayoutSlotsProps {
  width: number;
  multipliers: number[];
  betAmount: number;
}

export const PayoutSlots = ({ width, multipliers, betAmount }: PayoutSlotsProps) => {
  const slotWidth = width / multipliers.length;

  const getSlotColor = (multiplier: number) => {
    // Colors based on the reference table provided
    if (multiplier >= 25) return '#dc2626'; // Red for highest multipliers (25x+)
    if (multiplier >= 5) return '#f59e0b'; // Orange/Yellow for high multipliers (5x-24.99x)
    if (multiplier >= 2) return '#1e40af'; // Dark blue for medium-high multipliers (2x-4.99x)
    if (multiplier >= 1.5) return '#0891b2'; // Cyan for medium multipliers (1.5x-1.99x)
    if (multiplier >= 1.2) return '#059669'; // Green for low-medium multipliers (1.2x-1.49x)
    if (multiplier >= 1) return '#16a34a'; // Light green for slight profit (1x-1.19x)
    if (multiplier >= 0.7) return '#65a30d'; // Yellow-green for small loss (0.7x-0.99x)
    if (multiplier >= 0.5) return '#ca8a04'; // Yellow for medium loss (0.5x-0.69x)
    return '#dc2626'; // Red for high loss (below 0.5x)
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 flex">
      {multipliers.map((multiplier, index) => (
        <div
          key={index}
          className="flex-1 flex items-center justify-center text-xs font-bold border-r border-gray-700 last:border-r-0"
          style={{ 
            backgroundColor: getSlotColor(multiplier),
            width: slotWidth 
          }}
        >
          <span className="text-white drop-shadow-lg">
            x{multiplier}
          </span>
        </div>
      ))}
    </div>
  );
};
