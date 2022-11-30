import EventEmitter from 'events';
import _ from 'lodash';
import TypedEmitter from 'typed-emitter';
import { WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import PlayerController from './PlayerController';
/**
 * The events that the WordleAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type WordleAreaEvents = {
  scoreChange: (newScore: number) => void;
  occupantsChange: (newOccupants: PlayerController[]) => void;
  playingChange: (newPlaying: boolean) => void;
  historyChange: (newHistory: string[]) => void;
  solutionChange: (newSolution: string) => void;
  spectatingChange: (newSpectating: boolean) => void;
};

/**
 * A WordleAreaController manages the local behavior of a wordle area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of wordle areas and the
 * frontend's. The WordleAreaController emits events when the wordle area changes.
 */
export default class WordleAreaController extends (EventEmitter as new () => TypedEmitter<WordleAreaEvents>) {
  private _occupants: PlayerController[] = [];

  private _model: WordleAreaModel;

  /**
   * Create a new WordleAreaController
   * @param id
   */
  constructor(wordleAreaModel: WordleAreaModel) {
    super();
    this._model = wordleAreaModel;
  }

  /**
   * The playback state - true indicating that the video is playing, false indicating
   * that the video is paused.
   */
  public get isPlaying() {
    return this._model.isPlaying;
  }

  /**
   * The playback state - true indicating that a game is in progress,
   * false indicating there is no active game
   *
   * Changing this value will emit a 'playingChange' event to listeners
   */
  public set isPlaying(isPlaying: boolean) {
    if (this._model.isPlaying != isPlaying) {
      this.emit('playingChange', isPlaying);
      this._model.isPlaying = isPlaying;
    }
  }

  /**
   * Gets the guess history from the current wordle game.
   */
  public get guessHistory() {
    return this._model.guessHistory;
  }

  /**
   * Sets the guess history from the current wordle game.
   */
  public set guessHistory(newHistory: string[]) {
    if (this._model.guessHistory !== newHistory) {
      this.emit('historyChange', newHistory);
      this._model.guessHistory = newHistory;
    }
  }

  /**
   * Gets the solution from the current wordle game.
   */
  public get solution() {
    return this._model.solution;
  }

  /**
   * Sets the solution from the current wordle game.
   */
  public set solution(newSolution: string) {
    if (this._model.solution !== newSolution) {
      this.emit('solutionChange', newSolution);
      this._model.solution = newSolution;
    }
  }

  /**
   * The ID of this wordle area (read only)
   */
  get id() {
    return this._model.id;
  }

  /**
   * * The score of this wordle area (read only)
   */
  get score(): number {
    return this._model.currentScore;
  }

  /**
   * The score of this wordle area (read only)
   */
  set score(newScore: number) {
    if (this._model.currentScore !== newScore) {
      this.emit('scoreChange', newScore);
    }
    this._model.currentScore = newScore;
  }

  /**
   * Gets the list of current occupants.
   */
  get occupants() {
    return this._occupants;
  }

  /**
   * The list of occupants in this wordle area. Changing the set of occupants
   * will emit an occupantsChange event.
   */
  set occupants(newOccupants: PlayerController[]) {
    if (
      newOccupants.length !== this._occupants.length ||
      _.xor(newOccupants, this._occupants).length > 0
    ) {
      this.emit('occupantsChange', newOccupants);
      this._occupants = newOccupants;
    }
  }

  public get isGameWon() {
    return this._model.isWon;
  }

  public set isGameWon(value: boolean) {
    this._model.isWon = value;
  }

  public get isGameLost() {
    return this._model.isLost;
  }

  public set isGameLost(value: boolean) {
    this._model.isLost = value;
  }

  public get occupantIDs() {
    return this._model.occupantIDs;
  }

  public set occupantIDs(value: string[]) {
    this._model.occupantIDs = value;
  }

  public get mainPlayer() {
    return this._model.mainPlayer;
  }

  public set mainPlayer(value: string | undefined) {
    this._model.mainPlayer = value;
  }

  /**
   * A conversation area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    return this._occupants.length === 0;
  }

  /**
   * Return a representation of this WordleAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toWordleAreaModel(): WordleAreaModel {
    return {
      id: this.id,
      isPlaying: this.isPlaying,
      currentScore: this.score,
      guessHistory: this.guessHistory,
      solution: this.solution,
      isWon: this.isGameWon,
      isLost: this.isGameLost,
      occupantIDs: this.occupants.map(player => player.id),
      mainPlayer: this.mainPlayer,
    };
  }

  /**
   * Applies updates to this wordle area controller's model, setting the fields
   * isPlaying, score, guessHistory, isGameWon, isGameLost, occupantIDs, and mainPlayer
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: WordleAreaModel): void {
    this.isPlaying = updatedModel.isPlaying;
    this.score = updatedModel.currentScore;
    this.guessHistory = updatedModel.guessHistory;
    this.isGameWon = updatedModel.isWon;
    this.isGameLost = updatedModel.isLost;
    this.occupantIDs = updatedModel.occupantIDs;
    this.mainPlayer = updatedModel.mainPlayer;
  }
}
