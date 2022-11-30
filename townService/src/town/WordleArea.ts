import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { BoundingBox, TownEmitter, WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import DataAccess from './data/DataAccess';

export default class WordleArea extends InteractableArea {
  private _wordLength = 5;

  private _maxGuesses = 6;

  private _solution: string;

  private _isPlaying: boolean;

  private _currentScore: number;

  private _guessHistory: string[];

  private _mainPlayer: string | undefined;

  private _isWon: boolean;

  private _isLost: boolean;

  public occupantIDs: string[];

  public get solution(): string {
    return this._solution;
  }

  public set solution(value: string) {
    this._solution = value.toUpperCase();
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public set isPlaying(value: boolean) {
    this._isPlaying = value;
  }

  public get currentScore(): number {
    return this._currentScore;
  }

  public set currentScore(value: number) {
    this._currentScore = value;
  }

  public get guessHistory(): string[] {
    return this._guessHistory;
  }

  public set guessHistory(history: string[]) {
    this._guessHistory = history;
  }

  public get mainPlayer(): string | undefined {
    return this._mainPlayer;
  }

  public set mainPlayer(newPlayer: string | undefined) {
    this._mainPlayer = newPlayer;
  }

  public get isWon(): boolean {
    return this._isWon;
  }

  public get isLost(): boolean {
    return this._isLost;
  }

  /**
   * Creates a new WordleArea
   *
   * @param wordleArea model containing this area's starting state
   * @param coordinates the bounding box that defines this wordle area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, isPlaying, currentScore, guessHistory, occupantIDs }: WordleAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._isPlaying = isPlaying;
    this._guessHistory = guessHistory;
    this._mainPlayer = undefined;
    this._solution = DataAccess.getAccess().getValidWord(5);
    this._isLost = this._isGameLost();
    this._isWon = this._isGameWon();
    this._currentScore = currentScore;
    this.occupantIDs = occupantIDs;
  }

  /**
   * Checks if the game is currently in a state which references a player win.
   * @returns if the player has won
   */
  private _isGameWon(): boolean {
    return !this._isLost && this.guessHistory[this.guessHistory.length - 1] === this.solution;
  }

  /**
   * Checks if the game is currently in a state which references a player loss.
   * @returns if the player has lost
   */
  private _isGameLost(): boolean {
    return !this._isWon && this.guessHistory.length >= this._maxGuesses;
  }

  /**
   * Removes a player from this wordle area.
   *
   * When the last player leaves, this method sets this area to inactive and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._isPlaying = false;
      this._emitAreaChanged();
    }
  }

  /**
   * Calculates the current score of this wordle game.
   *
   * Adding 25 for each yellow letter, and 50 for each green in addition to score
   * based on how many attempts it took for the player to win.
   *
   * @returns the current score.
   */
  private _calculateScore(): number {
    const guessScores = [2000, 1500, 1000, 500, 250, 150];
    let bonusPoints = 0;
    this._guessHistory.forEach(eachGuess => {
      if (eachGuess !== this._solution) {
        for (let i = 0; i < eachGuess.length; i++) {
          if (this._solution[i] === eachGuess[i]) {
            // 50 points for each green letter
            bonusPoints += 50;
          } else if (this._solution.includes(eachGuess[i])) {
            // 25 for each yellow
            bonusPoints += 25;
          }
        }
      }
    });
    return (
      bonusPoints + (this._isWon || this._isLost ? guessScores[this.guessHistory.length - 1] : 0)
    );
  }

  /**
   * Updates the state of this WordleArea, setting the active state, guess history, occupants, and main player.
   *
   * Also calculates the current score, and computes whether the game has been won or lost.
   *
   * @param wordleArea updated model
   */
  public updateModel({ isPlaying, guessHistory, occupantIDs, mainPlayer }: WordleAreaModel) {
    this._isPlaying = isPlaying;
    this._guessHistory = guessHistory;
    this.occupantIDs = occupantIDs;
    this._mainPlayer = mainPlayer;
    this._isLost = this._isGameLost();
    this._isWon = this._isGameWon();
    this._currentScore = this._calculateScore();

    this._emitAreaChanged();
  }

  /**
   * Convert this WordleArea instance to a simple WordleAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): WordleAreaModel {
    return {
      id: this.id,
      isPlaying: this._isPlaying,
      currentScore: this._currentScore,
      guessHistory: this._guessHistory,
      isWon: this._isWon,
      isLost: this._isLost,
      occupantIDs: this._occupants.map(player => player.id),
      mainPlayer: this._mainPlayer,
    };
  }

  /**
   * Creates a new WordleArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): WordleArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed wordle area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WordleArea(
      {
        isPlaying: false,
        id: name,
        currentScore: 0,
        guessHistory: [],
        isWon: false,
        isLost: false,
        occupantIDs: [],
        mainPlayer: '',
      },
      rect,
      townEmitter,
    );
  }
}
