import { StaticInfoScreen } from '@/components/screens/StaticInfoScreen';
import { withGuard } from '@/navigation/withGuard';

/** SETTINGS → «Политика конфиденциальности» (`/settings/privacy`). */
function PrivacyScreen() {
  return (
    <StaticInfoScreen
      title="Политика конфиденциальности"
      sub="AcademicSpace"
      sections={[
        {
          paragraphs: [
            'AcademicSpace находится в разработке — приложение работает на демонстрационных данных, окончательный текст политики конфиденциальности будет опубликован до открытого запуска.',
          ],
        },
        {
          heading: 'Какие данные мы храним',
          paragraphs: [
            'Данные аккаунта: email, имя, класс. Анкета для подбора вузов: академические результаты, интересы и предпочтения.',
            'Для Premium-пользователей — загруженные документы (копилка), переписка с ИИ-ментором и результаты анализа портфолио.',
          ],
        },
        {
          heading: 'Как мы их используем',
          paragraphs: [
            'Данные анкеты используются только для подбора университетов и расчёта рейтинга внутри приложения — мы не передаём их третьим лицам и не используем для рекламы.',
          ],
        },
      ]}
    />
  );
}

export default withGuard(PrivacyScreen, { auth: true });
