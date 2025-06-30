/* src/components/games/cratebattles/CrateCard.tsx */
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { RustCrate } from './rustCrateData';

import './CrateCard.css';

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
  /* qty state ---------------------------------------------------- */
  const [qty, setQty] = useState(1);
  const inc = () => setQty((q) => Math.min(q + 1, 99));
  const dec = () => setQty((q) => Math.max(q - 1, 1));

  /* inspect popup ------------------------------------------------ */
  const inspect = (evt?: React.MouseEvent) => {
    /* ① stop the original pointer-down so Radix dialog never sees it */
    if (evt) {
      evt.stopPropagation();
      (evt.nativeEvent as PointerEvent).stopImmediatePropagation?.();
    }

    const html = crate.contents
      .map(
        (i) => `
      <div style="display:flex;flex-direction:column;align-items:center">
        <img src="${i.image}" style="width:52px" />
        <b>${i.name}</b>
        <small>${i.dropChance.toFixed(1)}%</small>
        <div style="display:flex;align-items:center;gap:3px">
          <img src="/img/icons/sulfur.svg" style="width:14px">${i.value.toFixed(2)}
        </div>
      </div>`
      )
      .join('');

    /* ② disable pointer-events on Radix overlay while popup is open */
    const battleOverlay = document.querySelector(
      '[data-radix-dialog-overlay]'
    ) as HTMLElement | null;
    battleOverlay?.style.setProperty('pointer-events', 'none');

    Swal.fire({
      title: `<img src="${crate.image}" style="width:38px"> ${crate.name}`,
      html: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">${html}</div>`,
      width: 680,
      background: '#141414',
      color: '#eaeaea',
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      zIndex: 2147483647,
    }).finally(() => {
      /* ③ restore overlay behaviour after popup closes */
      battleOverlay?.style.removeProperty('pointer-events');
    });
  };

  /* JSX ---------------------------------------------------------- */
  return (
    <div
      className={[
        'crate-card rounded-lg p-3 bg-[#111]/60 cursor-pointer transition',
        isSelected
          ? 'ring-2 ring-lime-500 shadow-lg shadow-lime-500/25'
          : 'hover:ring-2 hover:ring-lime-500/40',
      ].join(' ')}
      onClick={() => onSelect(crate)}
    >
      {/* thumbnail */}
      <img src={crate.image} alt={crate.name} className="w-full h-24 object-contain" />

      {/* name & price */}
      <h3 className="mt-2 font-semibold">{crate.name}</h3>
      <span className="text-sm flex items-center gap-1">
        <img
          src="/public/lovable-uploads/0dfb4836-73f0-4c1b-8f93-220e5f1025a4.png"
          className="w-7 h-7 align-middle"
        />
        {crate.price.toFixed(2)}
      </span>

      {/* action row – qty + ADD 🔍 */}
      <div className="action-row" onClick={(e) => e.stopPropagation()}>
        <button className="qty-btn" onClick={dec}>–</button>
        <span className="qty-display">{qty}</span>
        <button className="qty-btn" onClick={inc}>+</button>

        <button className="add-btn" onClick={() => onAddToBattle?.(crate, qty)}>
          + ADD
        </button>

        {/* pass the click event so we can stop it inside inspect() */}
        <button className="inspect-btn" title="Inspect crate" onClick={(e) => inspect(e)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00FF6E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </div>
  );
};
