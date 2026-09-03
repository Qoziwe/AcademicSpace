import { useLocalSearchParams } from 'expo-router';

import { DocumentVaultScreen } from '@/components/screens/DocumentVaultScreen';
import { useVault } from '@/hooks/api/useVaults';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';

/**
 * REQUIRED_DOCUMENTS (`/universities/:id/documents`). Premium-only —
 * Free по deep link редиректится на PAYWALL (`withGuard`). Собран по
 * VAULT_DETAIL-паттерну (`<DocumentVaultScreen>`) на той же копилке вуза.
 * Назад → UNIVERSITY_DETAILS.
 */
function RequiredDocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vaultQ = useVault(id ?? 'bologna');

  return (
    <DocumentVaultScreen
      title="Документы для поступления"
      caption={vaultQ.data?.deadline ?? 'список документов вуза'}
      onBack={backOr({ pathname: '/universities/[id]', params: { id: id ?? 'bologna' } })}
    />
  );
}

export default withGuard(RequiredDocumentsScreen, { auth: true, premium: true });
