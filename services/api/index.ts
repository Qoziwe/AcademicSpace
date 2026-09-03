/**
 * Слой доступа к данным = единственный «шов» между приложением и
 * источником данных (роадмап, Фаза 4).
 *
 * Хуки `hooks/api/*` импортируют отсюда объекты `<resource>Api` и не
 * знают, что за ними: на Фазах 0–7 это мок-хендлеры `mocks/handlers/*`
 * (форма ответа — `docs/api-contract.md`), на Фазе 8 — реальный Flask.
 * Единственная точка переключения — флаг `ENV.useMocks`
 * (`EXPO_PUBLIC_USE_MOCKS`), который читается в каждом
 * `services/api/<resource>.ts`. Интерфейсы `<Resource>Api` держат обе
 * реализации в одной форме, так что расхождение ловит компилятор.
 *
 * Фаза 8 сводится к дозаполнению `services/api/http/*` — ни хуки, ни
 * `mocks/` при этом не трогаются.
 */

export { achievementsApi } from './achievements';
export { analysisApi } from './analysis';
export { authApi } from './auth';
export { chatApi } from './chat';
export { profileApi } from './profile';
export { questionnaireApi } from './questionnaire';
export { subscriptionApi } from './subscription';
export { tasksApi } from './tasks';
export { universitiesApi } from './universities';
export { vaultsApi } from './vaults';
