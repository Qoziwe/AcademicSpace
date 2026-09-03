import { useLocalSearchParams } from 'expo-router';

import { DocumentVaultScreen } from '@/components/screens/DocumentVaultScreen';
import { useVault } from '@/hooks/api/useVaults';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';

/**
 * VAULT_DETAIL (`/documents/:vaultId`, `design-reference.html:746`).
 * Premium-only. Общий `<DocumentVaultScreen>` (ячейки-слоты, мок
 * file-picker). Назад → VAULTS_LIST.
 */
function VaultDetailScreen() {
  const { vaultId } = useLocalSearchParams<{ vaultId: string }>();
  const vaultQ = useVault(vaultId ?? 'bologna');

  return (
    <DocumentVaultScreen
      title={vaultQ.data?.universityName ?? 'Копилка'}
      caption={vaultQ.data?.deadline ?? 'копилка вуза'}
      onBack={backOr('/documents')}
    />
  );
}

export default withGuard(VaultDetailScreen, { auth: true, premium: true });
