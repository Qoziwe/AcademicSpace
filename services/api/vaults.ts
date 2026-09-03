/**
 * Адаптер-seam ресурса «vaults» (копилки документов). Развилка мок/HTTP —
 * по `ENV.useMocks`. Загрузка файла в ячейку — «стейт в моменте» в
 * `mocks/store.ts.toggleVaultCell` (мок file-picker), отдельного хендлера нет.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/vaults';

import * as http from './http/vaults';

export type ApiVault = mock.ApiVault;
export type ApiVaultDetail = mock.ApiVaultDetail;

export interface VaultsApi {
  getVaults(): Promise<ApiVault[]>;
  getVault(vaultId: string): Promise<ApiVaultDetail | null>;
}

export const vaultsApi: VaultsApi = {
  getVaults: ENV.useMocks ? mock.getVaults : http.getVaults,
  getVault: ENV.useMocks ? mock.getVault : http.getVault,
};
