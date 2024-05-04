
import { supercharge } from './plugin/vite-plugin.js'

export default supercharge
export { supercharge }

export { Vite, ViteTagAttributes } from './backend/vite.js'
export { ViteConfig } from './backend/vite-config.js'
export { ViteServiceProvider } from './vite-service-provider.js'

export { resolvePageComponent } from './inertia/inertia-helpers.js'
export { InertiaPageNotFoundError } from './inertia/inertia-page-not-found-error.js'

export { HotReloadFile } from './plugin/vite-hotfile.js'
export { PluginConfigContract, DevServerUrl } from './plugin/vite-plugin-types.js'
