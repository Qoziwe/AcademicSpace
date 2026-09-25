/**
 * Копилки документов (`GET /api/v1/vaults`, `GET /api/v1/vaults/:id`,
 * `POST /api/v1/vaults/:id/cells/:i`).
 *  - `useVaults()` — список (VAULTS_LIST);
 *  - `useVault(id)` — одна копилка (VAULT_DETAIL / REQUIRED_DOCUMENTS);
 *  - `useUploadVaultCell()` — загрузка/замена файла в ячейке.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { vaultsApi } from '@/services/api/vaults';

export function useVaults() {
  return useQuery({ queryKey: qk.vaults(), queryFn: vaultsApi.getVaults });
}

export function useVault(vaultId: string) {
  return useQuery({ queryKey: qk.vault(vaultId), queryFn: () => vaultsApi.getVault(vaultId) });
}

export function useUploadVaultCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      vaultId,
      cellIndex,
      file,
    }: {
      vaultId: string;
      cellIndex: number;
      file: { uri: string; name: string; mimeType?: string | null };
    }) => vaultsApi.uploadCell(vaultId, cellIndex, file),
    onSuccess: (_data, { vaultId }) => {
      void qc.invalidateQueries({ queryKey: qk.vault(vaultId) });
      void qc.invalidateQueries({ queryKey: qk.vaults() });
    },
  });
}
