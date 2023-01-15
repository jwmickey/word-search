import { Coordinates, DEFAULT_SIZE, Direction, getDirection, Grid, GridCell } from "./grid";

describe('grid', () => {
    it('creates a square grid by default', () => {
        const grid = new Grid();
        expect(grid).toBeDefined();
        expect(grid.width).toEqual(DEFAULT_SIZE);
        expect(grid.height).toEqual(DEFAULT_SIZE);
    });

    it('creates with a custom type', () => {
        const grid = new Grid<number>();
        expect(grid).toBeDefined();
        grid.write(0, 0, 5);
        expect(grid.cell(0, 0)).toEqual(5);
    });

    it('creates with initial values', () => {
        const grid = new Grid<number>(5, 5, { initialValue: 7 });
        expect(grid).toBeDefined();
        expect(grid.numFilledCells()).toEqual(25);
        expect(grid.cell(0, 0)).toEqual(7);
    });

    it('creates with initial value that is a function', () => {
        const grid = new Grid<string>(5, 5, { initialValue: () => ':-)' });
        expect(grid).toBeDefined();
        expect(grid.numFilledCells()).toEqual(25);
        expect(grid.cell(0, 0)).toEqual(':-)');
    });

    it('creates with a custom empty value comparator', () => {
        const grid = new Grid<number>(5, 5, { 
            initialValue: -1,
            emptyComparator: (x) => x < 0
        });
        expect(grid).toBeDefined();
        expect(grid.numFilledCells()).toEqual(0);
    });

    it('gets custom width and height', () => { 
        const width = 20;
        const height = 15;
        const grid = new Grid(width, height);
        expect(grid.width).toEqual(width);
        expect(grid.height).toEqual(height);
    });

    it('gets rows and cols', () => {
        const grid = new Grid<number>(3, 3);
        for (let i = 0; i < grid.size; i++) {
            grid.write(...grid.posToCoords(i), i);
        }
        expect(grid.rows).toEqual([
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        ]);
        expect(grid.cols).toEqual([
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
        ]);
    })

    it('gets position for x,y coordinates', () => {
        const grid = new Grid(10, 10);
        expect(grid.coordsToPos(0, 0)).toEqual(0);
        expect(grid.coordsToPos(5, 0)).toEqual(5);
        expect(grid.coordsToPos(1, 2)).toEqual(21);
        expect(grid.coordsToPos(8, 4)).toEqual(48);
    });

    it('returns invalid for an invalid x,y coordinate', () => {
        const grid = new Grid(10, 10);
        expect(grid.isValid(-1, -1)).toBe(false);
        expect(grid.isValid(10, 10)).toBe(false);
    });

    it('gets x,y coords for a position', () => {
        const grid = new Grid(10, 10);
        expect(grid.posToCoords(0)).toEqual([0, 0]);
        expect(grid.posToCoords(9)).toEqual([9, 0]);
        expect(grid.posToCoords(10)).toEqual([0, 1]);
        expect(grid.posToCoords(40)).toEqual([0, 4]);
        expect(grid.posToCoords(99)).toEqual([9, 9]);
    })

    it('isEmpty returns true when a cell has not been filled', () => {
        const grid = new Grid(10, 10);
        expect(grid.isEmpty(0, 0)).toBe(true);
    });

    it('isEmpty returns false when a cell has been filled', () => {
        const grid = new Grid(10, 10);
        grid.write(0, 0, 'X');
        expect(grid.isEmpty(0, 0)).toBe(false);
    });

    it('isEmpty returns false for an invalid coordinate', () => {
        const grid = new Grid(10, 10);
        expect(grid.isEmpty(12, 0)).toBe(false);
    });

    it('returns valid for a valid x,y coordinate', () => {
        const grid = new Grid(10, 10);
        expect(grid.isValid(0, 0)).toBe(true);
        expect(grid.isValid(4, 3)).toBe(true);
        expect(grid.isValid(9, 9)).toBe(true);
        expect(grid.isValid(0, 9)).toBe(true);
        expect(grid.isValid(9, 0)).toBe(true);
    });

    describe('cell', () => {
        it('returns undefined for an invalid coordinate', () => {
            const grid = new Grid(10, 10);
            expect(grid.cell(-1, 0)).toBeUndefined();
        });

        it('returns undefined for a cell that is not filled', () => {
            const grid = new Grid(10, 10);
            expect(grid.cell(0, 0)).toBeUndefined();
        });

        it('returns value for a cell that is filled', () => {
            const grid = new Grid(10, 10);
            grid.write(0, 0, 'X');
            expect(grid.cell(0, 0)).toEqual('X');
        });

        it('writes a value to a cell', () => {
            const grid = new Grid(10, 10);
            const x = 2, y = 2;
            const value = 'Hello';
            grid.write(x, y, value);
            expect(grid.cell(x, y)).toEqual(value);
        });
    });

    describe('gets neighbors of a cell', () => {
        let grid: Grid;

        beforeAll(() => {
            grid = new Grid(5, 5);
        })

        it.each([
            [Direction.N, 0, 0, undefined],
            [Direction.N, 0, 1, [0, 0]],
            [Direction.N, 0, 4, [0, 3]],
            [Direction.NE, 0, 0, undefined],
            [Direction.NE, 0, 1, [1, 0]],
            [Direction.NE, 4, 1, undefined],
            [Direction.E, 0, 0, [1, 0]],
            [Direction.E, 1, 0, [2, 0]],
            [Direction.E, 4, 0, undefined],
            [Direction.SE, 0, 0, [1, 1]],
            [Direction.SE, 4, 4, undefined],
            [Direction.SE, 3, 2, [4, 3]],
            [Direction.S, 0, 0, [0, 1]],
            [Direction.S, 3, 3, [3, 4]],
            [Direction.S, 0, 4, undefined],
            [Direction.SW, 0, 0, undefined],
            [Direction.SW, 1, 1, [0, 2]],
            [Direction.SW, 3, 2, [2, 3]],
            [Direction.W, 0, 0, undefined],
            [Direction.W, 4, 0, [3, 0]],
            [Direction.W, 2, 1, [1, 1]],
            [Direction.NW, 0, 0, undefined],
            [Direction.NW, 1, 1, [0, 0]],
            [Direction.NW, 3, 2, [2, 1]],
        ])('%s at [%i, %i] ', (direction, x, y, expected) => {
            expect(grid.neighbor(x, y, direction)).toEqual(expected);
        })
    });

    describe('gets number of empty neighbors', () => {
        let grid: Grid<number>;

        beforeAll(() => {
            grid = new Grid<number>(10, 10);
            grid.write(2, 2, 1);
            grid.write(2, 2, 1);
            grid.write(7, 2, 1);
            grid.write(2, 7, 1);
        })

        it.each([
            [Direction.W, 4, 2, 1],
            [Direction.W, 2, 2, 2],
            [Direction.W, 7, 2, 4],
            [Direction.E, 4, 2, 2],
            [Direction.E, 2, 3, 7],
            [Direction.E, 8, 2, 1],
            [Direction.S, 2, 1, 0],
            [Direction.S, 1, 0, 9],
            [Direction.S, 2, 9, 0],
            [Direction.N, 0, 0, 0],
            [Direction.N, 2, 5, 2],
            [Direction.N, 7, 4, 1],
            [Direction.NW, 4, 4, 1],
            [Direction.SE, 0, 5, 1],
            [Direction.SW, 8, 2, 7],
            [Direction.NE, 4, 5, 2],
        ])('%s at [%i, %i] ', (direction, x, y, expected) => {
            expect(grid.emptyNeighbors(x, y, direction)).toEqual(expected);
        });
    });

    it('gets number of filled and empty cells', () => {
        const grid = new Grid<number>(10, 10);
        expect(grid.numFilledCells()).toEqual(0);
        expect(grid.numEmptyCells()).toEqual(100);
        grid.write(0, 0, 1);
        expect(grid.numFilledCells()).toEqual(1);
        expect(grid.numEmptyCells()).toEqual(99);
        grid.write(0, 1, 1);
        grid.write(1, 1, 1);
        grid.write(4, 2, 1);
        expect(grid.numFilledCells()).toEqual(4);
        expect(grid.numEmptyCells()).toEqual(96);
        grid.write(4, 2, undefined);
        expect(grid.numFilledCells()).toEqual(3);
        expect(grid.numEmptyCells()).toEqual(97);
    });

    it('gets coordinates of empty cells', () => {
        const grid = new Grid<number>(2, 2);
        grid.write(0, 1, 1);
        grid.write(1, 1, 1);
        expect(grid.numFilledCells()).toEqual(2);
        const emptyCells = grid.emptyCells();
        expect(emptyCells).toEqual([[0, 0], [1, 0]]);
    });

    it('clears the grid', () => {
        const grid = new Grid<number>(10, 10);
        grid.write(0, 0, 1);
        grid.write(0, 1, 1);
        grid.write(1, 1, 1);
        grid.write(4, 2, 1);
        expect(grid.numFilledCells()).toEqual(4);
        grid.clear();
        expect(grid.numFilledCells()).toEqual(0);
    });

    describe('toString', () => {
        it('draws an empty grid', () => {
            const grid = new Grid(5, 3);
            const expected = deindentGrid(`
            +---+---+---+---+---+
            |   |   |   |   |   |
            +---+---+---+---+---+
            |   |   |   |   |   |
            +---+---+---+---+---+
            |   |   |   |   |   |
            +---+---+---+---+---+
            `);
            expect(grid.toString()).toEqual(expected);
        });

        it('draws a grid with filled spaces', () => {
            const grid = new Grid<boolean>(5, 3);
            grid.write(0, 0, true);
            grid.write(2, 1, true);
            grid.write(2, 2, true);
            const expected = deindentGrid(`
            +---+---+---+---+---+
            | · |   |   |   |   |
            +---+---+---+---+---+
            |   |   | · |   |   |
            +---+---+---+---+---+
            |   |   | · |   |   |
            +---+---+---+---+---+
            `);
            expect(grid.toString()).toEqual(expected);
        });

        it('draws a grid with single-char letters filled', () => {
            const grid = new Grid<'X'|'O'>(3, 3);
            grid.write(0, 0, 'X');
            grid.write(2, 0, 'X');
            grid.write(1, 1, 'X');
            grid.write(2, 1, 'O');
            grid.write(2, 2, 'O');
            const expected = deindentGrid(`
            +---+---+---+
            | X |   | X |
            +---+---+---+
            |   | X | O |
            +---+---+---+
            |   |   | O |
            +---+---+---+
            `);
            expect(grid.toString()).toEqual(expected);
        });

        it('draws a grid with numbers filled', () => {
            const grid = new Grid<number>(3, 3);
            grid.write(0, 0, 1);
            grid.write(2, 0, 7);
            grid.write(1, 1, 42);
            grid.write(2, 1, 3);
            const expected = deindentGrid(`
            +---+---+---+
            | 1 |   | 7 |
            +---+---+---+
            |   | · | 3 |
            +---+---+---+
            |   |   |   |
            +---+---+---+
            `);
            expect(grid.toString()).toEqual(expected);
        });

        it('draws a grid with type implementing GridCell filled', () => {
            const grid = new Grid<GridCell>(3, 3);
            grid.write(0, 0, { value: 1 });
            grid.write(2, 0, { value: 7 });
            grid.write(1, 1, { value: 42 });
            grid.write(2, 1, { value: 3 });
            const expected = deindentGrid(`
            +---+---+---+
            | 1 |   | 7 |
            +---+---+---+
            |   | · | 3 |
            +---+---+---+
            |   |   |   |
            +---+---+---+
            `);
            expect(grid.toString()).toEqual(expected);
        });
    });

    describe('gets the relative direction between two coordinates', () => {
        const tests: [Direction, Coordinates, Coordinates][] = [
            [Direction.NW, [1, 1], [0, 0]],
            [Direction.N , [1, 1], [1, 0]],
            [Direction.NE, [1, 1], [2, 0]],
            [Direction.E,  [1, 1], [2, 1]],
            [Direction.SE, [1, 1], [2, 2]],
            [Direction.S,  [1, 1], [1, 2]],
            [Direction.SW, [1, 1], [0, 2]],
            [Direction.W,  [1, 1], [0, 1]],
        ];
        it.each(tests)('%s', (direction: Direction, start, end) => {
            expect(getDirection(start, end)).toEqual(direction);
        });
    });
});

function deindentGrid(input: string): string {
    return input.split("\n").map(line => line.trim()).join("\n").replace(/^\n(.*)/, '$1');
}