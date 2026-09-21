import { FilterStepScreen } from '@/components/screens/FilterStepScreen';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_COUNTRY — общий экран шага фильтров (`CLAUDE.md` §7). */
function FilterCountryScreen() {
  return <FilterStepScreen stepIndex={0} />;
}

export default withGuard(FilterCountryScreen, { auth: true });
