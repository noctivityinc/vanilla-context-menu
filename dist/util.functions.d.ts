/**
 * Normalize the position of a target element so that it won't get out of bounds of the scope
 * @param mouse - mouseX and mouseY
 * @param target - target element that want to have it's position normalized
 * @param scope - the area to fit in
 */
export declare function normalizePozition(mouse: {
    x: number;
    y: number;
}, target: HTMLElement, scope: HTMLElement): {
    normalizedX: number;
    normalizedY: number;
};
