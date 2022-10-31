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

  get occupants() {
    return this._occupants;
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
    return this._model;
  }

  /**
   * Applies updates to this wordle area controller's model, setting the fields
   * isPlaying and score
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: WordleAreaModel): void {
    this.isPlaying = updatedModel.isPlaying;
    this.score = updatedModel.currentScore;
  }
}
