import { FilterStepScreen } from '@/components/screens/FilterStepScreen';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_FACULTY — общий экран шага фильтров (`CLAUDE.md` §7). */
function FilterFacultyScreen() {
  return <FilterStepScreen stepIndex={2} />;
}

export default withGuard(FilterFacultyScreen, { auth: true });
