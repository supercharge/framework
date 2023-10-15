
export interface ViewConfigBuilder {
  /**
   * Set the base layout used to render this view. The given `name` identifies
   * the file name of the layout file in the configured layouts folder.
   */
  layout(name: string): this
}
