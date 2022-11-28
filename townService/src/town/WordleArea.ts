import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { BoundingBox, TownEmitter, WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import DataAccess from './data/DataAccess';

export default class WordleArea extends InteractableArea {
  private _wordLength = 5;

  private _maxGuesses = 6;

  private _guessScores = [13, 8, 5, 3, 2, 1];

  private _solution: string;

  private _isPlaying: boolean;

  private _currentScore: number;

  private _guessHistory: string[];

  private _mainPlayer: Player | undefined;

  private _spectatorPlayers: Player[];

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

  public get mainPlayer(): Player | undefined {
    return this._mainPlayer;
  }

  public set mainPlayer(newPlayer: Player | undefined) {
    this._mainPlayer = newPlayer;
  }

  public get spectatorPlayers(): Player[] {
    return this._spectatorPlayers;
  }

  public set spectatorPlayers(spectators: Player[]) {
    this._spectatorPlayers = spectators;
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
    this._currentScore = currentScore;
    this._isPlaying = isPlaying;
    this._guessHistory = guessHistory;
    this._mainPlayer = undefined;
    this._spectatorPlayers = [];
    this._solution = DataAccess.getAccess().getValidWord(5);
    this._isWon = this.isGameWon();
    this._isLost = this.isGameLost();
    this.occupantIDs = occupantIDs;
  }

  /**
   * Checks if the game is currently in a state which references a player win.
   * @returns if the player has won
   */
  public isGameWon(): boolean {
    return this.guessHistory[this.guessHistory.length - 1] === this.solution;
  }

  /**
   * Checks if the game is currently in a state which references a player loss.
   * @returns if the player has lost
   */
  public isGameLost(): boolean {
    return !this.isGameWon() && this.guessHistory.length >= this._maxGuesses;
  }

  /**
   * Adds a guess to this game.
   * @param guess the full entered guess from the user
   * @throws if the game is over, the guess is not a valid length, or the guess is not a valid word
   */
  public addGuess(guess: string) {
    if (this.isGameWon() || this.isGameLost()) {
      throw new Error('Guess cannot be made on a finished game');
    } else if (guess.length !== this._wordLength) {
      throw new Error(`Given guess is not of length ${this._wordLength} (length: ${guess.length})`);
    } else if (!DataAccess.getAccess().isValidWord(guess)) {
      throw new Error(`Given word '${guess}' is not a word in the dictionary`);
    }

    this.guessHistory.push(guess.toUpperCase());
    this.currentScore = this._guessScores[this.guessHistory.length - 1];
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
   * Updates the state of this WordleArea, setting the active state, players, and game state
   *
   * @param wordleArea updated model
   */
  public updateModel({ isPlaying, currentScore, guessHistory, occupantIDs }: WordleAreaModel) {
    this._isPlaying = isPlaying;
    this._currentScore = currentScore;
    this._guessHistory = guessHistory;
    this._isWon = this.isGameWon();
    this._isLost = this.isGameLost();
    this.occupantIDs = occupantIDs;
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
      isWon: this.isGameWon(),
      isLost: this.isGameLost(),
      occupantIDs: this._occupants.map(player => player.id),
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
      },
      rect,
      townEmitter,
    );
  }
}
