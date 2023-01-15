export const DEFAULT_SIZE = 10;
export const DEFAULT_FILL_CHAR = '·';
export type Coordinates = [number, number];
export enum Direction {
    N = 'N',
    NE = 'NE',
    E = 'E',
    SE = 'SE',
    S = 'S',
    SW = 'SW',
    W = 'W',
    NW = 'NW',
}

export interface GridOptions<T> {
    initialValue?: T | (() => T),
    emptyComparator?: (arg0: T) => boolean;
}

export interface GridCell {
    value: string | number | boolean;
    meta?: unknown;
}

export class Grid<T = string> {
    private _width: number;
    private _height: number;
    private grid: Array<T | undefined> = [];

    constructor(width = DEFAULT_SIZE, height = 0, private options?: GridOptions<T>) {
        if (!height) {
            height = width;
        }
        this._width = width;
        this._height = height;
        this.initialize();
    }

    private emptyComparator(val: unknown): boolean {
        return val == null || val === '';
    }

    /**
     * Initializes the grid for the given dimensions, optionally fills the grid 
     * with an initial value for each cell
     */
    initialize() {
        this.grid = new Array(this._width * this._height);
        if (this.options?.initialValue) {
            if (typeof this.options.initialValue === 'function') {
                for (let i = 0; i < this.grid.length; i++) {
                    this.grid[i] = (this.options.initialValue as unknown as () => T)();
                }
            } else {
                this.grid.fill(this.options.initialValue);
            }
        }

        if (this.options?.emptyComparator) {
            this.emptyComparator = this.options.emptyComparator;
        }
    }

    /**
     * Clears the entire grid. 
     */
    clear(): void {
        this.grid.fill(undefined);
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    /**
     * Get an array of rows, with each entry containing an array of cells in the row
     */
    get rows() {
        const rows = [];
        for (let y = 0; y < this._height; y++) {
            const start = y * this._width;
            const end = start + this._width;
            rows.push(this.grid.slice(start, end));
        }
        return rows;
    }

    /**
     * Get an array of rows, with each entry containing an array of cells in the column 
     */
    get cols() {
        const cols = [];
        for (let x = 0; x < this._width; x++) {
            const col = [];
            for (let y = 0; y < this._height; y++) {
                col.push(this.grid[y * this._width + x]);
            }
            cols.push(col);
        }
        return cols;
    }

    /**
     * Get the number of elements in the grid
     */
    get size() {
        return this._width * this._height;
    }

    /**
     * Translates x,y cell coordinates to the array index of the grid.  Note that no 
     * boundary checks are performed, so this can return a set of coordinates that 
     * are off the grid.
     * 
     * @param x number
     * @param y number
     * @returns number
     */
    coordsToPos(x: number, y: number): number {
        return y * this._width + x;
    }

    posToCoords(pos: number): Coordinates {
        const x = pos > 0 ? pos % this._width : 0;
        const y = pos > 0 ? Math.floor(pos / this._width) : 0;
        return [x, y];
    }

    /**
     * Gets the value of the cell.  Returns undefined for a cell that has no set value 
     * or for a cell that is out of bounds.
     * 
     * @param x number
     * @param y number
     * @returns boolean
     */
    cell(x: number, y: number): T | undefined {
        return this.isValid(x, y) ? this.grid[this.coordsToPos(x, y)] : undefined;
    }

    /**
     * Determines if the given cell coordinates are within the range of the grid boundaries
     * 
     * @param x number
     * @param y number
     * @returns boolean
     */
    isValid(x: number, y: number): boolean {
        return y >= 0 && x >= 0 && y < this._height && x < this._width;
    }

    /**
     * Determines if a cell has a value that is not undefined 
     * 
     * @param x number
     * @param y number
     * @returns boolean
     */
    isEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) ? this.emptyComparator(this.grid[this.coordsToPos(x, y)]) : false;
    }

    /**
     * Writes a value to a cell.  Can also clear a cell by passing undefined as the value.
     * Silently ignores invalid cell coordinates
     * 
     * @param x number
     * @param y number
     * @param value T | undefined
     */
    write(x: number, y: number, value: T | undefined): void {
        const pos = this.coordsToPos(x, y);
        if (pos !== undefined) {
            this.grid[pos] = value;
        }
    }

    /**
     * Gets the x,y coordinates for the cell in the immediate direction relative to the 
     * given cell. Returns undefined if the resulting coordinates are not valid
     * 
     * @param x number
     * @param y number
     * @param direction Direction
     * @returns Coordinates | undefined
     */
    neighbor(x: number, y: number, direction: Direction): Coordinates | undefined {
        switch (direction) {
            case Direction.N:
                y--;
                break;
            case Direction.NE:
                y--;
                x++;
                break;
            case Direction.E:
                x++;
                break;
            case Direction.SE:
                y++;
                x++;
                break;
            case Direction.S:
                y++;
                break;
            case Direction.SW:
                y++;
                x--;
                break;
            case Direction.W:
                x--;
                break;  
            case Direction.NW:
                x--;
                y--;
                break;      
        }

        return this.isValid(x, y) ? [x, y] : undefined;
    }


    /**
     * Gets the number of neighbors in the direction of a cell that have an empty value.
     * Useful for determining the number of free spaces available in any direction.
     * 
     * @param x number
     * @param y number
     * @param direction Direction 
     * @returns number
     */
    emptyNeighbors(x: number, y: number, direction: Direction): number {
        const next = this.neighbor(x, y, direction);
        if (next && this.emptyComparator(this.cell(next[0], next[1]))) {
            return 1 + this.emptyNeighbors(next[0], next[1], direction);
        } 
        return 0;
    }

    /**
     * Gets the total number of cells in the grid that are filled with a value 
     * 
     * @returns number
     */
    numFilledCells(): number {
        return this.grid.filter(val => !this.emptyComparator(val)).length;
    }

    /**
     * Gets the total number of cells in the grid that are empty
     * 
     * @returns number
     */
    numEmptyCells(): number {
        return this.size - this.numFilledCells();
    }

    /**
     * Gets an array of Coordinates for all cells that are empty.  
     * Use numEmptyCells when only the total is needed. 
     * 
     * @returns Coordinates[]
     */
    emptyCells(): Coordinates[] {
        const empty = [];
        for (const [pos, val] of this.grid.entries()) {
            if (this.emptyComparator(val)) {
                empty.push(this.posToCoords(pos))
            }
        }
        return empty;
    }

    /**
     * Constructs a string representation of the grid.  Useful for debugging.
     * 
     * Each cell is represented with one character, with an empty space surrounding the 
     * character and a cell separator, for a total of four chars in width and height per 
     * cell.  Therefore, this may produce large results for a sizable grid.
     * 
     *  - If values are single letters or numbers, the value will be printed in the cell.
     *  - For all other cases (object, boolean, letters/numbers greater than 2 chars), a 
     *    dot will be displayed to represent that the cell is filled with some value.
     *  - An empty space is displayed for an unfilled cell.
     * 
     * @returns string
     */
    toString(): string {
        let str = '';

        for (let y = 0; y < this._height; y++) {
            str += '+---'.repeat(this._width) + "+\n";
            for (let x = 0; x < this._width; x++) {
                let value = ' ';
                if (!this.isEmpty(x, y)) {
                    const cellValue = this.cell(x, y);
                    if (isGridCell(cellValue) && cellValue.value.toString().length === 1) {
                        value = cellValue.value.toString();
                    } else if (cellValue && ['string', 'number'].includes(typeof cellValue) && cellValue.toString().length === 1) {
                        value = cellValue.toString();
                    } else {
                        value = DEFAULT_FILL_CHAR;
                    }
                }
                str += `| ${value} `;
            }
            str += "|\n";
        }
        str += '+---'.repeat(this._width) + "+\n";

        return str;
    }
}

/**
 * Gets the direction traveled if moving from start to end coordinates 
 * 
 * @param start 
 * @param end 
 * @returns Direction
 */
export function getDirection(start: Coordinates, end: Coordinates): Direction {
    const [x1, y1] = start;
    const [x2, y2] = end;

    if (x1 === x2) {
        return y1 > y2 ? Direction.N : Direction.S;
    } else if (y1 === y2) {
        return x1 > x2 ? Direction.W : Direction.E;
    } else if (x1 < x2 && y1 > y2) {
        return Direction.NE;
    } else if (x1 < x2 && y1 < y2) {
        return Direction.SE;
    } else if (x1 > x2 && y1 < y2) {
        return Direction.SW;
    } else {
        return Direction.NW;
    }
}

function isGridCell(val: unknown): val is GridCell {
    return (val as GridCell).value !== undefined;
}