import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { BoundingBox, TownEmitter, WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class WordleArea extends InteractableArea {
  private _isPlaying: boolean;

  private _currentScore: number;

  private _guessHistory: string[];

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

  /**
   * Creates a new WordleArea
   *
   * @param wordleArea model containing this area's starting state
   * @param coordinates the bounding box that defines this wordle area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, isPlaying, currentScore, guessHistory }: WordleAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._currentScore = currentScore;
    this._isPlaying = isPlaying;
    this._guessHistory = guessHistory;
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
  public updateModel({ isPlaying, currentScore, guessHistory }: WordleAreaModel) {
    this._isPlaying = isPlaying;
    this._currentScore = currentScore;
    this._guessHistory = guessHistory;
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
    };
  }

  /**
   * Creates a new ConversationArea object that will represent a Conversation Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): WordleArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed wordle area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WordleArea(
      { id: name, isPlaying: false, currentScore: 0, guessHistory: [] },
      rect,
      broadcastEmitter,
    );
  }
}
