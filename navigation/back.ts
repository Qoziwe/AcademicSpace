/**
 * Хелпер «назад» под колонку `Back behavior` реестра
 * (`docs/source/03-routes.md`). Если в стеке есть куда возвращаться —
 * `router.back()`; иначе (deep link, dev-переход) — `router.replace` на
 * экран из реестра.
 */

import { router, type Href } from 'expo-router';

export function backOr(fallback: Href): () => void {
  return () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };
}
