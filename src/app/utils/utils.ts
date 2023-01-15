/**
 * Picks a random item from an array
 * 
 * @param items 
 * @returns T
 */
export function randomFrom<T = unknown>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
} 
  
/**
 * Generates an array of numbers starting from min, up to and including max
 * 
 * @param min 
 * @param max 
 * @returns number[]
 */
export function range(min: number, max: number): number[] {
    return Array(max - min + 1).fill(min).map((x, y) => x + y)
}

/**
 * Removes an item from an array.  Uses Array.splice, so the original value is modified
 * Returns true if the item was found, false if not found or could not be removed.
 * 
 * @param list 
 * @param item 
 * @returns boolean
 */
export function removeItem(list: unknown[], item: unknown): boolean {
    const pos = list.findIndex(l => l === item);
    if (pos >= 0) {
        return list.splice(pos, 1).length === 1;
    } 

    return false;
}

/**
 * Gets a random letter from the English alphabet
 * 
 * @returns string
 */
export function randomLetter(): string {
  return randomFrom('abcdefghijklmnopqrstuvwxyz'.split(''));
}