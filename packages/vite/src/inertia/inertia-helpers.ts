
import { InertiaPageNotFoundError } from './inertia-page-not-found-error.js'

/**
 * Resolves the inertia page component for the given `path` from the available `pages`.
 *
 * @example
 * ```js
 * createInertiaApp({
 *   resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**\/*.vue')),
 *   setup({ el, App, props, plugin }) {
 *     …
 *   }
 *  });
 * ```
 */
export async function resolvePageComponent<T> (path: string, pages: Record<string, Promise<T> | (() => Promise<T>)>): Promise<T> {
  const page = pages[path]

  if (page == null) {
    throw new InertiaPageNotFoundError(path)
  }

  return typeof page === 'function'
    ? await page()
    : page
}
