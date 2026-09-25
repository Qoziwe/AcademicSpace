import type { ApiVault, ApiVaultCell, ApiVaultDetail } from '@/mocks/handlers/vaults';

import { apiFetch } from './client';

export function getVaults(): Promise<ApiVault[]> {
  return apiFetch<ApiVault[]>('GET', '/vaults');
}

export function getVault(vaultId: string): Promise<ApiVaultDetail | null> {
  return apiFetch<ApiVaultDetail | null>('GET', `/vaults/${vaultId}`);
}

export async function uploadVaultCell(
  vaultId: string,
  cellIndex: number,
  file: { uri: string; name: string; mimeType?: string | null },
): Promise<{ cell: ApiVaultCell }> {
  const blob = await (await fetch(file.uri)).blob();
  const form = new FormData();
  form.append('file', blob, file.name);
  return apiFetch('POST', `/vaults/${vaultId}/cells/${cellIndex}`, form);
}
