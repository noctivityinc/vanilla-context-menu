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
export interface BaseMenuOption {
    label: string;
    callback?: (ev: MouseEvent) => unknown;
    /**
     * @deprecated This property was replaced by the new iconHTML property
     */
    iconClass?: string;
    iconHTML?: string;
    preventCloseOnClick?: boolean;
    itemClass?: string;
}
export interface MenuOption extends BaseMenuOption {
    nestedMenu?: NestedMenuItem[];
}
export type MenuItem = MenuOption | 'hr';
export type NestedMenuItem = BaseMenuOption | 'hr';
