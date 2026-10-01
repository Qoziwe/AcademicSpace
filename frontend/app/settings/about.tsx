import { StaticInfoScreen } from '@/components/screens/StaticInfoScreen';
import { withGuard } from '@/navigation/withGuard';

/** SETTINGS → «О нас» (`/settings/about`). */
function AboutScreen() {
  return (
    <StaticInfoScreen
      title="О нас"
      sub="AcademicSpace"
      sections={[
        {
          paragraphs: [
            'AcademicSpace — приложение для школьников 9–11 классов, которое помогает выбрать университет и спланировать поступление.',
          ],
        },
        {
          heading: 'Что внутри',
          paragraphs: [
            'Алгоритмический подбор вузов по категориям Safety / Match / Reach на основе анкеты об успеваемости и предпочтениях.',
            'ИИ-ментор в чате с интерактивными модулями — дорожными картами, чек-листами и таймерами фокусировки.',
            'Премиум-анализ портфолио: ИИ разбирает резюме, эссе и достижения и даёт рекомендации.',
            'Копилка документов по каждому вузу и геймификация с уровнями и опытом за выполненные задачи.',
          ],
        },
        {
          heading: 'Версия',
          paragraphs: ['1.0.0 (24)'],
        },
      ]}
    />
  );
}

export default withGuard(AboutScreen, { auth: true });
