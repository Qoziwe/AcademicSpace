/**
 * Адаптер-seam ресурса «vaults» (копилки документов). Развилка мок/HTTP —
 * по `ENV.useMocks`. `uploadCell` — реальный `expo-document-picker` +
 * multipart на бекенде (Фаза 8.8); мок-ветка имитирует успех без байтов.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/vaults';

import * as http from './http/vaults';

export type ApiVault = mock.ApiVault;
export type ApiVaultCell = mock.ApiVaultCell;
export type ApiVaultDetail = mock.ApiVaultDetail;

export interface VaultsApi {
  getVaults(): Promise<ApiVault[]>;
  getVault(vaultId: string): Promise<ApiVaultDetail | null>;
  uploadCell(
    vaultId: string,
    cellIndex: number,
    file: { uri: string; name: string; mimeType?: string | null },
  ): Promise<{ cell: ApiVaultCell }>;
}

export const vaultsApi: VaultsApi = {
  getVaults: ENV.useMocks ? mock.getVaults : http.getVaults,
  getVault: ENV.useMocks ? mock.getVault : http.getVault,
  uploadCell: ENV.useMocks
    ? (vaultId, cellIndex) => mock.uploadCell(vaultId, cellIndex)
    : http.uploadVaultCell,
};
