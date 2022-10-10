'use strict'

export interface ViewConfig {
  /**
   * Defines the default view driver.
   */
  driver: 'handlebars' | string

  /**
   * The Handlebars view config.
   */
  handlebars: {
    /**
     * Stores the path to the view files.
     */
    views: string

    /**
     * Stores the path to the view partial files.
     */
    partials: string

    /**
     * Stores the path to the view helper files.
     */
    helpers: string

    /**
     * Stores the path to the view layout files.
     */
    layouts: string

    /**
     * Stores the name of the default layout.
     */
    defaultLayout: string
  }
}
