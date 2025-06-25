import { ConfigurableOptions, Options } from './@types/interface';
declare class BaseContextMenu {
    #private;
    options: Options;
    initialContextMenuEvent: MouseEvent | undefined;
    applyStyleOnContextMenu: (contextMenu: HTMLElement, outOfBoundsOnX: boolean, outOfBoundsOnY: boolean) => void;
    /**
     * Interpolate the state variables inside the pug element and create an HTML Element
     */
    buildContextMenu: () => HTMLElement;
    updateOptions(configurableOptions: Partial<ConfigurableOptions>): void;
    getNormalizedPosition: (mouseX: number, mouseY: number, contextMenu: HTMLElement) => {
        normalizedX: number;
        normalizedY: number;
    };
}
export default class VanillaContextMenu extends BaseContextMenu {
    #private;
    constructor(configurableOptions: ConfigurableOptions);
    /**
     * Remove all the event listeners that were registered for this feature
     */
    off(): void;
    /**
     * Close the context menu
     */
    close(): void;
}
export {};
