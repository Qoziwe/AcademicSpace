/**
 * Мок-хендлер копилок документов. Контракт — `docs/api-contract.md`
 * §Document Vaults (`GET /api/v1/vaults`, `POST /api/v1/vaults/:id/cells/:i`).
 * Заполнение первой копилки перекрывается общим `mocks/store.ts.vaultCells`
 * (та же копилка открывается и из UNIVERSITY_DETAILS).
 */

import { delay } from '@/mocks/delay';
import { DOCUMENT_SLOTS, VAULTS, type VaultSeed } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface ApiVault {
  id: string;
  universityName: string;
  /** Короткое имя вуза для строк-сводок. */
  shortName: string;
  deadline: string;
  filled: number;
  cellsTotal: number;
}

function filledFor(seed: VaultSeed): number {
  if (seed.id === VAULTS[0]?.id) {
    return useMockStore.getState().vaultCells.filter(Boolean).length;
  }
  return seed.filledFixed;
}

export function getVaults(): Promise<ApiVault[]> {
  return delay(
    VAULTS.map((v) => ({
      id: v.id,
      universityName: v.name,
      shortName: v.shortName,
      deadline: v.deadline,
      filled: filledFor(v),
      cellsTotal: v.cellsTotal,
    })),
  );
}

export interface ApiVaultDetail extends ApiVault {
  cells: { title: string; sub: string; uploaded: boolean }[];
}

export function getVault(vaultId: string): Promise<ApiVaultDetail | null> {
  const seed = VAULTS.find((v) => v.id === vaultId) ?? VAULTS[0];
  if (!seed) return delay(null);

  const cellsState = useMockStore.getState().vaultCells;
  return delay({
    id: seed.id,
    universityName: seed.name,
    shortName: seed.shortName,
    deadline: seed.deadline,
    filled: filledFor(seed),
    cellsTotal: seed.cellsTotal,
    cells: DOCUMENT_SLOTS.map((slot, i) => ({
      title: slot.title,
      sub: slot.filledSub,
      uploaded: cellsState[i] ?? false,
    })),
  });
}
