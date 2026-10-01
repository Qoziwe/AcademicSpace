import { StaticInfoScreen } from '@/components/screens/StaticInfoScreen';
import { withGuard } from '@/navigation/withGuard';

/** SETTINGS → «Условия использования» (`/settings/terms`). */
function TermsScreen() {
  return (
    <StaticInfoScreen
      title="Условия использования"
      sub="AcademicSpace"
      sections={[
        {
          paragraphs: [
            'AcademicSpace находится в разработке — приложение работает на демонстрационных данных, окончательный текст условий использования будет опубликован до открытого запуска.',
            'Уже сейчас: регистрируясь, вы соглашаетесь, что сервис используется для подбора университетов и подготовки к поступлению, а размещённые рекомендации не заменяют консультацию приёмной комиссии вуза.',
          ],
        },
        {
          heading: 'Подписка',
          paragraphs: [
            'Платная подписка AcademicSpace Premium открывает ИИ-ментора, анализ портфолио, копилки документов и инструменты фокусировки. Отменить подписку можно в любой момент в разделе «Управление подпиской» — доступ сохраняется до конца оплаченного периода.',
          ],
        },
      ]}
    />
  );
}

export default withGuard(TermsScreen, { auth: true });
