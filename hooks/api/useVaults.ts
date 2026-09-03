/**
 * Копилки документов (`GET /api/v1/vaults`, `GET /api/v1/vaults/:id`).
 *  - `useVaults()` — список (VAULTS_LIST);
 *  - `useVault(id)` — одна копилка (VAULT_DETAIL).
 */

import { useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getVault, getVaults } from '@/mocks/handlers/vaults';

export function useVaults() {
  return useQuery({ queryKey: qk.vaults(), queryFn: getVaults });
}

export function useVault(vaultId: string) {
  return useQuery({ queryKey: qk.vault(vaultId), queryFn: () => getVault(vaultId) });
}
