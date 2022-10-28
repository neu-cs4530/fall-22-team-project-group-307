import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import WordleArea from './WordleArea';

describe('WordleArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: WordleArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const isPlaying = true;
  const currentScore = 1;
  const guessHistory = ['AUDIO', 'STONE'];
  const defaultCurrentScore = 0;
  const defaultGuessHistory: string[] = [];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new WordleArea(
      { id, isPlaying, currentScore, guessHistory },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('get/set', () => {
    it('Gets the initialized isPlaying value', () => {
      expect(testArea.isPlaying).toEqual(isPlaying);
    });
    it('Sets the isPlaying value', () => {
      testArea.isPlaying = !isPlaying;
      expect(testArea.isPlaying).not.toEqual(isPlaying);
    });
    it('Gets the initialized currentScore value', () => {
      expect(testArea.currentScore).toEqual(currentScore);
    });
    it('Sets the currentScore value', () => {
      testArea.currentScore = currentScore + 1;
      expect(testArea.currentScore).toEqual(currentScore + 1);
    });
    it('Gets the initialized mainPlayer value', () => {
      expect(testArea.mainPlayer).toEqual(undefined);
    });
    it('Sets the mainPlayer value', () => {
      testArea.mainPlayer = newPlayer;
      expect(testArea.mainPlayer).toEqual(newPlayer);
      testArea.mainPlayer = undefined;
      expect(testArea.mainPlayer).toEqual(undefined);
    });
    it('Gets the initialized guessHistory value', () => {
      expect(testArea.guessHistory).toEqual(guessHistory);
    });
    it('Sets the guessHistory value', () => {
      testArea.guessHistory = guessHistory.concat(['OTHER']);
      expect(testArea.guessHistory).toEqual(guessHistory.concat(['OTHER']));
      testArea.guessHistory = [];
      expect(testArea.guessHistory).toEqual([]);
    });
    it('Gets the initialized spectatorPlayers value', () => {
      expect(testArea.spectatorPlayers).toEqual([]);
    });
    it('Sets the spectatorPlayers value', () => {
      testArea.spectatorPlayers = [newPlayer];
      expect(testArea.spectatorPlayers).toEqual([newPlayer]);
      testArea.spectatorPlayers = [newPlayer, newPlayer];
      expect(testArea.spectatorPlayers).toEqual([newPlayer, newPlayer]);
      testArea.spectatorPlayers = [];
      expect(testArea.spectatorPlayers).toEqual([]);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        isPlaying,
        currentScore,
        guessHistory,
      });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Sets the isPlaying property to false when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        isPlaying: false,
        currentScore,
        guessHistory,
      });
      expect(testArea.isPlaying).toEqual(false);
    });
  });
  test('updateModel sets isPlaying, currentScore, and guessHistory', () => {
    testArea.updateModel({
      id: 'ignore',
      isPlaying: false,
      currentScore: 2,
      guessHistory: ['FIRST'],
    });
    expect(testArea.isPlaying).toBe(false);
    expect(testArea.currentScore).toBe(2);
    expect(testArea.guessHistory).toStrictEqual(['FIRST']);
  });
  test('toModel returns the ID, isPlaying, currentScore, and guessHistory', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      isPlaying,
      currentScore,
      guessHistory,
    });
  });
});
