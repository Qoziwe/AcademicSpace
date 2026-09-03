import { useLocalSearchParams } from 'expo-router';

import { DocumentVaultScreen } from '@/components/screens/DocumentVaultScreen';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';

/**
 * REQUIRED_DOCUMENTS (`/universities/:id/documents`). Premium-only —
 * Free по deep link редиректится на PAYWALL (`withGuard`). Собран по
 * VAULT_DETAIL-паттерну (`<DocumentVaultScreen>`). Назад → UNIVERSITY_DETAILS.
 */
function RequiredDocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <DocumentVaultScreen
      title="Документы для поступления"
      caption="дедлайн 12 мая · 9 ячеек"
      onBack={backOr({ pathname: '/universities/[id]', params: { id: id ?? 'bologna' } })}
    />
  );
}

export default withGuard(RequiredDocumentsScreen, { auth: true, premium: true });
