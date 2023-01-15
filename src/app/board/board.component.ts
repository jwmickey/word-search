import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Grid, Direction, Coordinates, GridCell, getDirection } from '../utils/grid';
import { randomFrom, range, removeItem, randomLetter } from '../utils/utils';

interface BoardCell extends GridCell {
  value: string;
  classes: string[];
}

interface WordList {
  original: string;
  normalized: string;
  found: boolean;
  origin: Coordinates;
  direction: Direction;
}
 
@Component({
  selector: 'word-search-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @Input() size = 10;
  @Input() words: string[] = [];
  @Output() winGame = new EventEmitter<boolean>();

  board: Grid<BoardCell> = new Grid<BoardCell>();
  startCoord: Coordinates | undefined = undefined;
  endCoord: Coordinates | undefined = undefined;
  wordList: WordList[] = [];

  get foundWords() {
    return this.filterWords(true);
  }

  get remainingWords() {
    return this.filterWords(false);
  }

  private filterWords(includeFound: boolean) {
    return this.wordList.filter(val => val.found === includeFound).map(val => val.original);
  }

  private checkWinCondition() {
    if (this.remainingWords.length === 0) {
      this.winGame.emit(true);
    }
  }

  ngOnInit() {
    this.start();
  }

  start() {
    this.board = new Grid<BoardCell>(
      this.size, 
      this.size, 
      { 
        initialValue: createCell,
        emptyComparator: isEmpty
      }
    ); 
    this.wordList = this.words.map(word => ({
      original: word,
      normalized: word.toLowerCase().replace(/(\W)+/g, ''),
      found: false,
      origin: [0, 0],
      direction: Direction.N
    }));
    this.wordList.sort((a, b) => (b.normalized.length - a.normalized.length));
    this.setupBoard();
  }

  /**
   * Starts or ends a word selection.  If ending a word selection, checks that the 
   * selection is valid and marks the word as found.
   * 
   * @param x 
   * @param y 
   */
  /* istanbul ignore next */
  handleClick(x: number, y: number) {
    if (this.startCoord) {
      this.endCoord = [x, y];
      const [isValid, word] = this.validateSelection();
      const startCell = this.board.cell(this.startCoord[0], this.startCoord[1]);
        if (startCell) {
          removeItem(startCell.classes, 'begin-selection');
        }
      if (isValid) {
        this.markFound(word);
      }
    
      this.startCoord = undefined;
      this.endCoord = undefined;
    } else {
      this.startCoord = [x, y];
      this.board.cell(x, y)?.classes.push('begin-selection');
    }
  }

  markFound(normalizedWord: string) {
    const entry = this.wordList.find((val) => val.normalized === normalizedWord);
    if (!entry) {
      return;
    }

    entry.found = true;
    const direction = entry.direction;
    let [x, y] = entry.origin;
    for (let i = 0; i < entry.normalized.length; i++) {
      const cell = this.board.cell(x, y);
      if (!cell) break;
      
      const classes = cell.classes;
      if (classes) {
        classes.push('found');
        classes.push(`direction-${direction}`);
        if (i === 0) {
          classes.push(`direction-${direction}-start`);
        } else if (i === entry.normalized.length - 1) {
          classes.push(`direction-${direction}-end`);
        }
      }

      const next = this.board.neighbor(x, y, direction);
      if (!next) break;
      x = next[0];
      y = next[1];
    }

    this.checkWinCondition();
  }

  /**
   * Gets the letters from start to end coordinates as a string
   * 
   * TODO: this currently uses directio but does not check that 
   *       the last coordinate is actually in the path, resulting 
   *       in a "forgiving" selection behavior.
   * 
   * @returns string
   */
  getSelectedText(): string {
    if (!this.startCoord || !this.endCoord) {
      return '';
    }

    const direction = getDirection(this.startCoord, this.endCoord);
    const length = Math.max(
      Math.abs(this.startCoord[0] - this.endCoord[0]), 
      Math.abs(this.startCoord[1] - this.endCoord[1])
    ) + 1;

    let word = '';
    let [x, y] = this.startCoord;
    for (let i = 0; i < length; i++) {
      word += this.board.cell(x, y)?.value;
      const next = this.board.neighbor(x, y, direction);
      if (!next) break;
      x = next[0];
      y = next[1];
    }
    return word;
  }

  inWordList(normalizedWord: string): boolean {
    return this.wordList.findIndex(val => val.normalized === normalizedWord) > -1;
  }

  validateSelection(): [boolean, string] {
    let word = this.getSelectedText();
    let inWordList = false;
    if (this.inWordList(word)) {
      inWordList = true;
    } else {
      const reversed = word.split('').reverse().join('');
      if (this.inWordList(reversed)) {
        inWordList = true;
        word = reversed;
      }
    }
    return [inWordList, word];
  }

  setupBoard() {
    const unplaceable: string[] = [];
    const start = Date.now();
    this.wordList.forEach((val, i) => {
      const placement = this.tryToPlace(val.normalized);
      if (!placement) {
        // couldn't place it, give up and remove it from the list!
        unplaceable.push(this.wordList.splice(i, 1)[0].original);
      } else {
        val.origin = placement[0];
        val.direction = placement[1];
      }
    });
    if (window?.localStorage.getItem('__DEBUG')) {
      console.log(this.board.toString());
    }
    if (unplaceable.length) {
      console.warn('Unable to place: ', unplaceable.join(', '));
    }


    // fill empty cells with random letters
    this.board.emptyCells().forEach(([x, y]) => {
      this.board.write(x, y, createCell(randomLetter()));
    });
  }

  tryToPlace(normalizedWord: string, attempts = 0): [Coordinates, Direction] | false {
    if (attempts > 100) {
      return false;
    }

    const startCoord = this.pickRandomStartCoord(normalizedWord);
    const direction = this.placementDirection(normalizedWord, startCoord);
    if (direction) {
      this.placeWord(normalizedWord, startCoord, direction);
      return [startCoord, direction];
    } else {
      return this.tryToPlace(normalizedWord, attempts + 1);
    }
  }

  placementDirection(normalizedWord: string, startCoord: Coordinates): Direction | false {
    const chars = normalizedWord.split('');
    const directions = randomDirection();
    let direction = directions.next();
    while (!direction.done) {
      let placed = 0;
      let [x, y] = startCoord;
      for (let i = 0; i < chars.length; i++) {
        if (!this.board.isValid(x, y)) {
          // hit a boundary, try next direction
          break;
        } 
        const cell = this.board.cell(x, y);
        if (cell && !['', chars[i]].includes(cell.value)) {
          // cell is filled with a different letter, try next direction
          break;
        }
        const neighbor = this.board.neighbor(x, y, direction.value);
        if (!neighbor) {
          // next neighbor is out of bounds, try next direction
          break;
        }
        // this letter can go here
        placed++;
        x = neighbor[0];
        y = neighbor[1];
      }

      // this will fit!
      if (placed === chars.length) {
        return direction.value;
      }

      // won't fit, try the next random direction
      direction = directions.next();
    }

    // word can't go here!
    return false;
  }

  /**
   * Pick a random (physically valid) start position on the board for the given word.
   * Avoids 
   * 
   * @returns Coordinates
   */
  pickRandomStartCoord(normalizedWord: string): Coordinates {
    const xLen = this.board.width - normalizedWord.length;
    const yLen = this.board.height - normalizedWord.length;
    const xPool = [...range(0, xLen), ...range(this.board.width - xLen - 1, this.board.width - 1)];
    const yPool = [...range(0, yLen), ...range(this.board.height - yLen - 1, this.board.height - 1)];
    const x = randomFrom(xPool);
    const y = randomFrom(yPool);
    return [x, y];
  }

  /**
   * Places a word at the given start coordinates in the given direction.  Assumes the 
   * cells that will be written to are empty or already have the same letter.
   * 
   * @param word 
   * @param x 
   * @param y 
   * @param direction 
   * @returns boolean
   */
  placeWord(word: string, startCoord: Coordinates, direction: Direction): boolean {
    let [x, y] = startCoord;
    for (let i = 0; i < word.length; i++) {
      this.board.write(x, y, createCell(word[i]));
      const next = this.board.neighbor(x, y, direction);
      if (!next) {
        return false;
      }
      x = next[0];
      y = next[1];
    }
    return true;
  }
}

/**
 * Creates a generator function which will yield all values of Direction enum 
 * in a random order.
 * 
 * @returns generator
 */
function* randomDirection() {
  const directions = Object.keys(Direction);
  directions.sort(() => Math.random() > 0.5 ? -1 : 1);
  for (let i = 0; i < directions.length; i++) {
    yield directions[i] as Direction;
  }
}

/**
 * Creates a BoardCell object
 * 
 * @param value 
 * @param classes 
 * @returns BoardCell
 */
function createCell(value = '', classes = []): BoardCell {
  return {
    value,
    classes
  }
}

function isEmpty(cell: BoardCell): boolean {
  return cell.value === '';
}