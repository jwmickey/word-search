import { getForm, playButton, endButton, gameBoard, remainingWords, wordsTextarea, cell } from '../support/app.po';

describe('word-search', () => {
  beforeEach(() => cy.visit('/'));

  it('should display game form', () => {
    getForm().should('be.visible');
  });

  it('should start the game when clicking play', () => {
    playButton().click();
    getForm().should('not.exist');
    gameBoard().should('be.visible');
  });

  it('should end the game when clicking end game', () => {
    playButton().click();
    gameBoard().should('be.visible');
    endButton().click();
    getForm().should('be.visible');
    gameBoard().should('not.exist');
  });

  it('should display the list of words when the game is started', () => {
    wordsTextarea().clear().type('hello, world');
    playButton().click();
    remainingWords().find('li').contains('hello').should('be.visible');
    remainingWords().find('li').contains('world').should('be.visible');
  });

  it('should highlight the start letter when clicking', () => {
    playButton().click();
    cell(2, 2).click();
    cell(2, 2).should('have.class', 'begin-selection');
    cell(4, 4).click();
    cell(2, 2).should('not.have.class', 'begin-selection');
  });
});
