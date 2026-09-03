import { FilterStepScreen } from '@/components/screens/FilterStepScreen';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_COST — общий экран шага фильтров (`CLAUDE.md` §7). */
function FilterCostScreen() {
  return <FilterStepScreen stepIndex={4} />;
}

export default withGuard(FilterCostScreen, { auth: true });
