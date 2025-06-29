// Dependencies
import { sanitize } from 'dompurify';

// Base & Template * Style
import style from './index.scss';
import template from './index.pug';
import gridTemplate from './grid.pug';

// Utils
import { normalizePozition } from './util.functions';

// Types
import {
  CoreOptions,
  DefaultOptions,
  MenuItem,
  ConfigurableOptions,
  Options,
  MenuOption,
  GridConfig,
} from './@types/interface';

interface State {
  style: Partial<CSSStyleDeclaration>;
  menuItems: MenuItem[];
}

interface GridState {
  style: Partial<CSSStyleDeclaration>;
  gridConfig: GridConfig;
  gridId: string;
}

class BaseContextMenu {
  #state: State = { style, menuItems: [] };
  #coreOptions: CoreOptions = { transformOrigin: ['top', 'left'] };
  #defaultOptions: DefaultOptions = {
    theme: 'black',
    transitionDuration: 200,
    normalizePosition: true,
  };

  //@ts-ignore
  options: Options = {};
  initialContextMenuEvent: MouseEvent | undefined;

  #sanitizeMenuIcons = (menuItems: MenuItem[]): MenuItem[] =>
    menuItems.map((item) => {
      typeof item === 'object' &&
        item.hasOwnProperty('iconHTML') &&
        (item.iconHTML = sanitize(item.iconHTML));
      return item;
    });

  #bindNestedMenuListener(menuItems: MenuItem[]): MenuItem[] {
    menuItems
      .filter(
        (item) =>
          typeof item === 'object' &&
          (item.hasOwnProperty('nestedMenu') ||
            item.hasOwnProperty('nestedGrid'))
      )
      .map((item: MenuOption) => {
        const providedCallback = item.callback;
        item.callback = (ev: MouseEvent) => {
          providedCallback && providedCallback(ev);

          if (item.nestedGrid) {
            new NestedGridContextMenu(
              { ...this.options, menuItems: [] },
              ev,
              //@ts-ignore
              document.getElementById(`context-menu-item-${item._id}`),
              item.nestedGrid,
              //@ts-ignore
              item._id
            );
          } else if (item.nestedMenu) {
            new NestedContextMenu(
              { ...this.options, menuItems: item.nestedMenu },
              ev,
              //@ts-ignore
              document.getElementById(`context-menu-item-${item._id}`)
            );
          }
        };
      });
    return menuItems;
  }

  #addIdToMenuItems(menuItems: MenuItem[]) {
    menuItems
      .filter((item) => typeof item === 'object')
      .forEach((item: MenuOption, index) => {
        //@ts-ignore
        item._id = Date.now() + index;
        if (item.nestedMenu) this.#addIdToMenuItems(item.nestedMenu);
      });
  }

  applyStyleOnContextMenu = (
    contextMenu: HTMLElement,
    outOfBoundsOnX: boolean,
    outOfBoundsOnY: boolean
  ): void => {
    contextMenu.style.transitionDuration = `${this.options.transitionDuration}ms`;

    const transformOrigin: [string, string] = Array.from(
      this.options.transformOrigin
    ) as [string, string];
    outOfBoundsOnX && (transformOrigin[1] = 'right');
    outOfBoundsOnY && (transformOrigin[0] = 'bottom');
    contextMenu.style.transformOrigin = transformOrigin.join(' ');

    if (this.options.customThemeClass) {
      contextMenu.classList.add(this.options.customThemeClass);
    } else {
      contextMenu.classList.add(
        style[`context-menu--${this.options.theme}-theme`]
      );
    }

    this.options.customClass &&
      contextMenu.classList.add(this.options.customClass);
  };

  buildContextMenu = (): HTMLElement => {
    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = template(this.#state);
    return wrapper.children[0] as HTMLElement;
  };

  buildGridContextMenu = (
    gridConfig: GridConfig,
    gridId: string
  ): HTMLElement => {
    const gridState: GridState = { style, gridConfig, gridId };
    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = gridTemplate(gridState);
    return wrapper.children[0] as HTMLElement;
  };

  updateOptions(configurableOptions: Partial<ConfigurableOptions>): void {
    const sanitizedMenuItems = this.#sanitizeMenuIcons(
      configurableOptions.menuItems
    );
    const menuItems = this.#bindNestedMenuListener(sanitizedMenuItems);
    this.#addIdToMenuItems(menuItems);

    Object.assign(this.options, this.#defaultOptions);
    Object.assign(this.options, { ...configurableOptions, menuItems });
    Object.assign(this.options, this.#coreOptions);

    this.#state.menuItems = this.options.menuItems;
  }

  getNormalizedPosition = (
    mouseX: number,
    mouseY: number,
    contextMenu: HTMLElement
  ): { normalizedX: number; normalizedY: number } => {
    let normalizedX = mouseX;
    let normalizedY = mouseY;

    if (this.options.normalizePosition) {
      const normalizedPosition = normalizePozition(
        { x: mouseX, y: mouseY },
        contextMenu,
        this.options.scope
      );
      ({ normalizedX, normalizedY } = normalizedPosition);
    }

    return { normalizedX, normalizedY };
  };
}

class NestedGridContextMenu extends BaseContextMenu {
  gridConfig: GridConfig;
  gridId: string;

  #removeExistingNestedContextMenu = (): void => {
    document
      .querySelector(`.${style['context-menu']}.nested-grid-menu`)
      ?.remove();
  };

  #bindGridInteractions = (contextMenu: HTMLElement): void => {
    const cells = contextMenu.querySelectorAll(
      `.${style['grid-cell']}`
    ) as NodeListOf<HTMLElement>;
    const selectionInfo = contextMenu.querySelector(
      `.${style['selection-info']}`
    ) as HTMLElement;

    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', (e) => {
        const target = e.target as HTMLElement;
        const row = parseInt(target.dataset.row || '1');
        const col = parseInt(target.dataset.col || '1');

        cells.forEach((c) => c.classList.remove(style['selected']));
        cells.forEach((c) => {
          const cellRow = parseInt(c.dataset.row || '1');
          const cellCol = parseInt(c.dataset.col || '1');
          if (cellRow <= row && cellCol <= col) {
            c.classList.add(style['selected']);
          }
        });

        // selectionInfo.textContent = `${row} × ${col}`;
      });

      cell.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const row = parseInt(target.dataset.row || '1');
        const col = parseInt(target.dataset.col || '1');

        this.gridConfig.callback(row, col);
        this.#removeExistingNestedContextMenu();
        document.querySelector(`.${style['context-menu']}`)?.remove();
      });
    });

    contextMenu.addEventListener('mouseleave', () => {
      cells.forEach((c) => c.classList.remove(style['selected']));
      // selectionInfo.textContent = 'Hover to select';
    });
  };

  #showContextMenu(event: MouseEvent, parentEl: HTMLElement) {
    this.initialContextMenuEvent = event;
    this.#removeExistingNestedContextMenu();

    const contextMenu: HTMLElement = this.buildGridContextMenu(
      this.gridConfig,
      this.gridId
    );
    contextMenu.classList.add('nested-context-menu');
    const body = document.querySelector('body');
    if (body) {
      body.append(contextMenu);
    }

    this.applyStyleOnContextMenu(contextMenu, false, false);

    const {
      x: parentX,
      y: parentY,
      width: parentWidth,
    } = parentEl.getBoundingClientRect();

    // Check if positioning to the right would go out of bounds
    const wouldOverflowRight =
      parentX + parentWidth + contextMenu.clientWidth > window.innerWidth;

    let adjustedX: number;

    if (wouldOverflowRight) {
      // Position to the left of the parent element
      adjustedX = parentX - contextMenu.clientWidth;
    } else {
      // Position to the right of the parent element (default)
      adjustedX = parentX + parentWidth;
    }

    // Use the parent element's Y position directly (not normalized position)
    // to align with the specific menu item
    const adjustedY = parentY;

    contextMenu.style.top = `${adjustedY}px`;
    contextMenu.style.left = `${adjustedX}px`;
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    this.#bindGridInteractions(contextMenu);
    setTimeout(() => contextMenu.classList.add(style['visible']));
  }

  // eslint-disable-next-line max-params
  constructor(
    configurableOptions: ConfigurableOptions,
    event: MouseEvent,
    parentEl: HTMLElement,
    gridConfig: GridConfig,
    gridId: string
  ) {
    super();
    this.gridConfig = gridConfig;
    this.gridId = gridId;
    this.updateOptions(configurableOptions);
    this.#showContextMenu(event, parentEl);
  }
}

class NestedContextMenu extends BaseContextMenu {
  #removeExistingNestedContextMenu = (): void => {
    document
      .querySelector(`.${style['context-menu']}.nested-context-menu`)
      ?.remove();
  };

  #bindCallbacks = (contextMenu: HTMLElement): void => {
    this.options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === 'hr' || !menuItem.callback) return;

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;
      htmlEl.onclick = () => {
        if (menuItem.callback && this.initialContextMenuEvent) {
          menuItem.callback(this.initialContextMenuEvent);
        }

        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.options.preventCloseOnClick ??
          false;
        if (!preventCloseOnClick) {
          this.#removeExistingNestedContextMenu();
          document.querySelector(`.${style['context-menu']}`)?.remove();
        }
      };
    });
  };

  #showContextMenu(event: MouseEvent, parentEl: HTMLElement) {
    this.initialContextMenuEvent = event;
    this.#removeExistingNestedContextMenu();

    const contextMenu: HTMLElement = this.buildContextMenu();
    contextMenu.classList.add('nested-context-menu');
    const body = document.querySelector('body');
    if (body) {
      body.append(contextMenu);
    }

    this.applyStyleOnContextMenu(contextMenu, false, false);

    const {
      x: parentX,
      y: parentY,
      width: parentWidth,
    } = parentEl.getBoundingClientRect();

    // Check if positioning to the right would go out of bounds
    const wouldOverflowRight =
      parentX + parentWidth + contextMenu.clientWidth > window.innerWidth;

    let adjustedX: number;

    if (wouldOverflowRight) {
      // Position to the left of the parent element
      adjustedX = parentX - contextMenu.clientWidth;
    } else {
      // Position to the right of the parent element (default)
      adjustedX = parentX + parentWidth;
    }

    // Use normalized position for Y coordinate to handle vertical overflow
    const { normalizedY } = this.getNormalizedPosition(
      parentX,
      parentY,
      contextMenu
    );
    const adjustedY = normalizedY;

    contextMenu.style.top = `${adjustedY}px`;
    contextMenu.style.left = `${adjustedX}px`;
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    this.#bindCallbacks(contextMenu);
    setTimeout(() => contextMenu.classList.add(style['visible']));
  }

  constructor(
    configurableOptions: ConfigurableOptions,
    event: MouseEvent,
    parentEl: HTMLElement
  ) {
    super();
    this.updateOptions(configurableOptions);
    this.#showContextMenu(event, parentEl);
  }
}

export default class VanillaContextMenu extends BaseContextMenu {
  #removeExistingContextMenu = (): void => {
    this.#removeExistingNestedContextMenus();
    document.querySelector(`.${style['context-menu']}`)?.remove();
  };

  #removeExistingNestedContextMenus = (): void => {
    document
      .querySelectorAll(`.${style['context-menu']}.nested-context-menu`)
      .forEach((el) => el.remove());
  };

  #bindCallbacks = (contextMenu: HTMLElement): void => {
    this.options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === 'hr' || !menuItem.callback) return;

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;
      htmlEl.onclick = () => {
        if (menuItem.callback && this.initialContextMenuEvent) {
          menuItem.callback(this.initialContextMenuEvent);
        }

        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.options.preventCloseOnClick ??
          false;
        if (!preventCloseOnClick) {
          this.#removeExistingContextMenu();
        }
      };
    });
  };

  #onShowContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    this.initialContextMenuEvent = event;
    this.#removeExistingContextMenu();

    const contextMenu: HTMLElement = this.buildContextMenu();
    const body = document.querySelector('body');
    if (body) {
      body.append(contextMenu);
    }

    const { clientX: mouseX, clientY: mouseY } = event;
    const { normalizedX, normalizedY } = this.getNormalizedPosition(
      mouseX,
      mouseY,
      contextMenu
    );

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    this.applyStyleOnContextMenu(
      contextMenu,
      mouseX !== normalizedX,
      mouseY !== normalizedY
    );
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    this.#bindCallbacks(contextMenu);
    setTimeout(() => contextMenu.classList.add(style['visible']));
  };

  #onDocumentClick = (event: MouseEvent): void => {
    const clickedTarget: HTMLElement = event.target as HTMLElement;
    if (clickedTarget.closest(`.${style['context-menu']}`)) return;
    this.#removeExistingContextMenu();
  };

  constructor(configurableOptions: ConfigurableOptions) {
    super();
    this.updateOptions(configurableOptions);
    this.options.scope.oncontextmenu = this.#onShowContextMenu;
    document.addEventListener('click', this.#onDocumentClick);
  }

  off(): void {
    document.removeEventListener('click', this.#onDocumentClick);
    this.options.scope.oncontextmenu = null;
  }

  close(): void {
    this.#removeExistingContextMenu();
  }
}
