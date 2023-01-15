import {
    randomFrom,
    randomLetter,
    range,
    removeItem
} from './utils';

describe('utils', () => {
    describe('range', () => {
        it('gets a range of numbers', () => {
            const expected = [0, 1, 2, 3, 4, 5];
            expect(range(0, 5)).toEqual(expected);
        });

        it('using negative numbers', () => {
            const expected = [-5, -4, -3, -2, -1];
            expect(range(-5, -1)).toEqual(expected);
        });

        it('of length 1', () => {
            const expected = [42];
            expect(range(42, 42)).toEqual(expected);
        });
    });

    describe('randomFrom', () => {
        it('gets a random entry from the array', () => {
            const pool = [1, 5, 7, 42, 365];
            const x = randomFrom(pool);
            expect(pool).toContain(x);
        });

        it('using strings', () => {
            const pool = ['a', 'b', 'c'];
            const x = randomFrom(pool);
            expect(pool).toContain(x);
        });
    });

    describe('randomLetter', () => {
        it('gets a random letter from the english alphabet', () => {
            const letter = randomLetter();
            expect(letter).toMatch(/[a-z]{1}/i);
        });
    });

    describe('removeItem', () => {
        let pool: number[];

        beforeEach(() => {
           pool = [1, 2, 3, 4, 5]
        });

        it('removes an item from an array', () => {
            const removed = removeItem(pool, 3);
            expect(removed).toBe(true);
            expect(pool).toEqual([1, 2, 4, 5]);
        });

        it('removes an item from the beginning', () => {
            const removed = removeItem(pool, 1);
            expect(removed).toBe(true);
            expect(pool).toEqual([2, 3, 4, 5]);
        });

        it('removes an item from the end', () => {
            const removed = removeItem(pool, 5);
            expect(removed).toBe(true);
            expect(pool).toEqual([1, 2, 3, 4]);
        });

        it('returns false when the item does not exist in the array', () => {
            const removed = removeItem(pool, 6);
            expect(removed).toBe(false);
            expect(pool).toEqual([1, 2, 3, 4, 5]);
        });
    })
});