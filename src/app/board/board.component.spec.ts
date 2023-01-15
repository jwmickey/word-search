import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dir } from 'console';
import { Coordinates, Direction } from '../utils/grid';

import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    component.size = 10;
    component.words = ['foo', 'bar', 'baz'];
    component.start();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.board.size).toEqual(100);
    expect(component.wordList).toHaveLength(component.words.length);
  });

  describe('finding words', () => {
    it('should mark a word as found', () => {
      component.markFound('foo');
      expect(component.foundWords).toEqual(['foo']);
      expect(component.remainingWords).toEqual(['bar', 'baz'])
    });
  
    it('should do nothing when the found word does not exist in the word list', () => {
      component.markFound('nope');
      expect(component.foundWords).toHaveLength(0);
      expect(component.remainingWords).toHaveLength(3);
    });

    it('finds a word by clicking on start and end coords', () => {
      component.size = 10;
      component.words = ['foo'];
      component.start();

      const { origin, direction, original } = component.wordList[0];
      let dest = origin;
      for (let i = 0; i < original.length - 1; i++) {
        const next = component.board.neighbor(dest[0], dest[1], direction);
        if (next) {
          dest = next;
        } else {
          throw new Error('Error finding word at: ' + dest.toString());
        }
      }
      // find in order
      component.startCoord = origin;
      component.endCoord = dest;
      let [isValid, foundWord] = component.validateSelection();
      expect(isValid).toBe(true);
      expect(foundWord).toEqual(original);

      // find when selected backwards
      component.startCoord = dest;
      component.endCoord = origin;
      [isValid, foundWord] = component.validateSelection();
      expect(isValid).toBe(true);
      expect(foundWord).toEqual(original);
    });
  });

  it('gets selected text', () => {
    const start: Coordinates = [0, 0];
    const end: Coordinates = [0, 2];
    const col = component.board.cols[0];
    const colAsString = col.slice(0, 3).map((cell) => cell?.value).join('');
    component.startCoord = start;
    component.endCoord = end;
    expect(component.getSelectedText()).toEqual(colAsString);
  });

  it('returns empty string when no text is selected', () => {
    expect(component.getSelectedText()).toEqual('');
  });

  describe('in word list', () => {
    it('returns true when the word is in the list', () => {
      expect(component.inWordList('foo')).toEqual(true);
    });

    it('returns false when word is not in the list', () => {
      expect(component.inWordList('nope')).toEqual(false);
    });

    it('validates selection when selected text is in ascending order', () => {
      // TODO: PITA
    });

    it('validates selection when selected text is in descending order', () => {
      // TODO: PITA
    });
  });

  it('emits win event when all words are found', () => {
    component.words = ['foo'];
    component.start();
    const spy = jest.spyOn(component.winGame, 'emit');
    component.markFound('foo');
    expect(spy).toHaveBeenCalledWith(true);
  })
});
