import { FilterStepScreen } from '@/components/screens/FilterStepScreen';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_UNIVERSITY — общий экран шага фильтров (`CLAUDE.md` §7). */
function FilterUniversityScreen() {
  return <FilterStepScreen stepIndex={1} />;
}

export default withGuard(FilterUniversityScreen, { auth: true });
