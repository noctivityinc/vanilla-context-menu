import { ConfigurableOptions, Options, GridConfig } from './@types/interface';
declare class BaseContextMenu {
    #private;
    options: Options;
    initialContextMenuEvent: MouseEvent | undefined;
    applyStyleOnContextMenu: (contextMenu: HTMLElement, outOfBoundsOnX: boolean, outOfBoundsOnY: boolean) => void;
    buildContextMenu: () => HTMLElement;
    buildGridContextMenu: (gridConfig: GridConfig, gridId: string) => HTMLElement;
    updateOptions(configurableOptions: Partial<ConfigurableOptions>): void;
    getNormalizedPosition: (mouseX: number, mouseY: number, contextMenu: HTMLElement) => {
        normalizedX: number;
        normalizedY: number;
    };
}
export default class VanillaContextMenu extends BaseContextMenu {
    #private;
    constructor(configurableOptions: ConfigurableOptions);
    off(): void;
    close(): void;
}
export {};
