// core options are like default options, but they are not ment to be over written
export interface CoreOptions {
  transformOrigin: [string, string]; // ex top left
}
export interface DefaultOptions {
  transitionDuration: number;
  theme: 'black' | 'white';
  normalizePosition?: boolean;
}

export interface ConfigurableOptions extends Partial<DefaultOptions> {
  scope: HTMLElement;
  menuItems: MenuItem[];
  customClass?: string;
  customThemeClass?: string;
  preventCloseOnClick?: boolean; // default will be false - global value for all menu items
  onOpen?: (event: MouseEvent) => void; // callback when menu opens
}

export interface Options extends ConfigurableOptions, CoreOptions {}

export interface GridConfig {
  rows: number;
  columns: number;
  callback: (row: number, column: number) => void;
}

export interface BaseMenuOption {
  label: string;
  callback?: (ev: MouseEvent) => unknown;
  /**
   * @deprecated This property was replaced by the new iconHTML property
   */
  iconClass?: string;
  iconHTML?: string;
  contentHTML?: string; // Allow HTML content in menu items
  preventCloseOnClick?: boolean; // default will be false - individual value for each item (it will override the global value if any)
  itemClass?: string; // custom class for the entire menu item
}

export interface MenuOption extends BaseMenuOption {
  nestedMenu?: NestedMenuItem[];
  nestedGrid?: GridConfig; // NEW: Grid selector feature
}

export type MenuItem = MenuOption | 'hr';
export type NestedMenuItem = BaseMenuOption | 'hr';
