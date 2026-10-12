/** One chip in a marquee row: a human label plus an icon key. */
export interface StackItem {
    name: string;
    /** Key resolved in `TechMarquee.ICON_MAP` (react-icons Simple Icons). */
    icon: string;
}

/** One horizontal running line. */
export interface StackRow {
    /** Text on the yellow tab pinned to the left edge of the row. */
    label: string;
    items: StackItem[];
    /** `true` scrolls right, `false` (default) scrolls left. */
    reverse?: boolean;
}
