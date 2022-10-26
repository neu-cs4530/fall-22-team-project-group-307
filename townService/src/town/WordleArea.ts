import Player from '../lib/Player';
import { BoundingBox, TownEmitter, WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class WordleArea extends InteractableArea {
  private _isPlaying: boolean;

  private _currentScore: number;

  private _mainPlayer: Player | undefined;

  private _spectatorPlayers: Player[];

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

  /**
   * Creates a new WordleArea
   *
   * @param wordleArea model containing this area's starting state
   * @param coordinates the bounding box that defines this wordle area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, isPlaying }: WordleAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._currentScore = 0;
    this._isPlaying = isPlaying;
    this._mainPlayer = undefined;
    this._spectatorPlayers = [];
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
   * @param viewingArea updated model
   */
  public updateModel({ isPlaying, currentScore }: WordleAreaModel) {
    this._isPlaying = isPlaying;
    this._currentScore = currentScore;
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
    };
  }
}
