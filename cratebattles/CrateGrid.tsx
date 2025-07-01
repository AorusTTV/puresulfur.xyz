import React, { useState, useMemo } from 'react';
import { CrateCard }       from './CrateCard';
import { rustCrates }      from './rustCrateData';
import { Button }          from '@/components/ui/button';
import { Badge }           from '@/components/ui/badge';

interface CrateGridProps {
  /** called when the user taps *Select* on a card */
  onCrateSelect?: (crate: any) => void;
  /** called when the user hits +ADD (crate, qty) */
  onAddToBattle?: (crate: any, quantity: number) => void;
}

/**
 * Renders every crate in a responsive grid and keeps basket state.
 * Quantity buttons & Inspect modal live inside <CrateCard/>.
 */
export const CrateGrid: React.FC<CrateGridProps> = ({
  onCrateSelect,
  onAddToBattle,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* quick stats for the header badge */
  const totalCrates = useMemo(() => rustCrates.length, []);

  return (
    <section>
      {/* ── header row ────────────────────────── */}
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Select Your Crate</h2>
        <Badge variant="outline">{totalCrates} crates&nbsp;available</Badge>
      </header>

      {/* ── grid of crate cards ───────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rustCrates.map((crate) => (
          <CrateCard
            key={crate.id}
            crate={crate}
            isSelected={selectedId === crate.id}
            onSelect={(c) => {
              /* click again to un-select */
              setSelectedId((prev) => (prev === c.id ? null : c.id));
              onCrateSelect?.(c);
            }}
            /* enable Qty ± & ADD row */
            onAddToBattle={onAddToBattle}
          />
        ))}
      </div>

      {/* ── clear-selection helper ─────────────── */}
      {selectedId && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => setSelectedId(null)}>
            Clear selection
          </Button>
        </div>
      )}
    </section>
  );
};
