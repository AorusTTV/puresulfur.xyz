import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { RustCrate } from './rustCrateData';
import { Button }    from '@/components/ui/button';

interface Props {
  crate: RustCrate;
  isSelected: boolean;
  onSelect: (crate: RustCrate) => void;
  onAddToBattle?: (crate: RustCrate, qty: number) => void;
}

export const CrateCard: React.FC<Props> = ({
  crate,
  isSelected,
  onSelect,
  onAddToBattle,
}) => {
  const [qty, setQty] = useState(1);

  /* ─────────────  helpers  ────────────── */
  const inc = () => setQty((q) => Math.min(q + 1, 99));
  const dec = () => setQty((q) => Math.max(q - 1, 1));

  const inspect = () => {
    const html = crate.contents
      .map(
        (i) => `
        <div style="display:flex;flex-direction:column;align-items:center">
          <img src="${i.image}" style="width:52px" />
          <b>${i.name}</b>
          <small>${i.dropChance.toFixed(1)} %</small>
          <div style="display:flex;align-items:center;gap:2px">
            <img src="/img/icons/sulfur.svg" style="width:14px">${i.value.toFixed(2)}
          </div>
        </div>`
      )
      .join('');
    Swal.fire({
      title: `<img src="${crate.image}" style="width:36px"> ${crate.name}`,
      html: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">${html}</div>`,
      width: 680,
      background: '#141414',
      color: '#eaeaea',
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  /* ─────────────  JSX  ────────────── */
  return (
    <div
      className={`crate-card ${isSelected ? 'ring-2 ring-lime-500' : ''}`}
      onClick={() => onSelect(crate)}
    >
      <img src={crate.image} alt={crate.name} className="w-full h-24 object-contain" />

      <h3 className="font-semibold mt-2">{crate.name}</h3>
      <span className="text-sm flex items-center gap-1">
        <img src="/img/icons/sulfur.svg" className="w-3" />
        {crate.price.toFixed(2)}
      </span>

      {/* qty + add row */}
      <div className="flex items-center gap-2 mt-2">
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); dec(); }}>
          −
        </Button>
        <span className="min-w-[24px] text-center">{qty}</span>
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); inc(); }}>
          +
        </Button>

        <Button
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onAddToBattle?.(crate, qty);
          }}
        >
          + ADD
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            inspect();
          }}
        >
          <i className="ph ph-magnifying-glass" />
        </Button>
      </div>
    </div>
  );
};
