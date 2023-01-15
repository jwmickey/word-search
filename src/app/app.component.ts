import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'word-search-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'word-search';
  size = 16;
  words = `pigskin
touchdown
kick
punt
receiver
field
defense
flag,
pass
interception
yards
halftime
time out
block
sack
  `;
  wordList: string[] = [];
  started = false;
  won = false;

  playGame(form: NgForm) {
    this.started = true;
    this.won = false;
    this.size = form.value.size;
    this.wordList = form.value.words
      .split(/[,|\n]/g)
      .map((w: string) => w.trim())
      .filter((w: string) => w.length > 0)
  }

  endGame() {
    this.started = false;
  }

  onWinGame() {
    this.won = true;
  }

  showEndGameButton() {
    return this.started && !this.won;
  }
}
