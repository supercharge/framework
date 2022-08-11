'use strict'

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
    throw new Error(`Inertia page not found: ${path}`)
  }

  return typeof page === 'function'
    ? page()
    : page
}
