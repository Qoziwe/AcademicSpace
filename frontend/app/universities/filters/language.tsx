import { FilterStepScreen } from '@/components/screens/FilterStepScreen';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_LANGUAGE — общий экран шага фильтров (`CLAUDE.md` §7). */
function FilterLanguageScreen() {
  return <FilterStepScreen stepIndex={3} />;
}

export default withGuard(FilterLanguageScreen, { auth: true });
