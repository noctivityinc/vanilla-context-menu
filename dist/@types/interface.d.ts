export interface CoreOptions {
    transformOrigin: [string, string];
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
    preventCloseOnClick?: boolean;
    onOpen?: (event: MouseEvent) => void;
}
export interface Options extends ConfigurableOptions, CoreOptions {
}
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
    contentHTML?: string;
    preventCloseOnClick?: boolean;
    itemClass?: string;
}
export interface MenuOption extends BaseMenuOption {
    nestedMenu?: NestedMenuItem[];
    nestedGrid?: GridConfig;
}
export type MenuItem = MenuOption | 'hr';
export type NestedMenuItem = BaseMenuOption | 'hr';
