export const getForm = () => cy.get('#setupForm');

export const wordsTextarea = () => cy.get('#setupForm textarea');

export const playButton = () => cy.get('button').contains('Play');

export const endButton = () => cy.get('button').contains('End Game');

export const gameBoard = () => cy.get('.board');

export const foundWords = () => cy.get('.wordlist .found');

export const remainingWords = () => cy.get('.wordlist .remaining');

export const cell = (x: number, y: number) => gameBoard().find(`div:nth-child(${y + 1}) > div:nth-child(${x + 1})`);