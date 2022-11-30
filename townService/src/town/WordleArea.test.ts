import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter, WordleArea as WordleAreaModel } from '../types/CoveyTownSocket';
import WordleArea from './WordleArea';

describe('WordleArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: WordleArea;
  let blankTestArea: WordleArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const isPlaying = true;
  const currentScore = 8;
  const guessHistory = ['AUDIO', 'STONE'];
  const solution = 'RIGHT';


  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new WordleArea(
      {
        id,
        isPlaying,
        currentScore,
        guessHistory,
        solution,
        isWon: false,
        isLost: false,
        occupantIDs: [],
      },
      testAreaBox,
      townEmitter,
    );
    blankTestArea = new WordleArea(
      {
        id: nanoid(),
        isPlaying: true,
        currentScore,
        guessHistory: [],
        solution,
        isWon: false,
        isLost: false,
        occupantIDs: [],
      },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(newPlayerID, mock<TownEmitter>());
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
      testArea.mainPlayer = newPlayer.id;
      expect(testArea.mainPlayer).toEqual(newPlayer.id);
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
        solution: testArea.solution,
        isWon: false,
        isLost: false,
        occupantIDs: testArea.occupantsByID,
        mainPlayer: testArea.mainPlayer,
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
        solution: testArea.solution,
        isWon: false,
        isLost: false,
        occupantIDs: [],
        mainPlayer: testArea.mainPlayer,
      });
      expect(testArea.isPlaying).toEqual(false);
    });
  });
  describe('updateModel', () => {
    let newModel: WordleAreaModel;
    beforeEach(() => {
      blankTestArea.solution = 'GUESS';
      newModel = {
        id: nanoid(),
        isPlaying: true,
        currentScore: 0,
        guessHistory: ['GUESS'],
        isWon: false,
        isLost: false,
        occupantIDs: ['occupant1'],
        mainPlayer: 'occupant1',
      };
    });
    it('Sets the active state, guess history, occupants, and main player and emits an interactableUpdate event', () => {
      newModel.isPlaying = false;
      blankTestArea.updateModel(newModel);

      expect(blankTestArea.isPlaying).toBe(false);
      expect(blankTestArea.guessHistory).toStrictEqual(['GUESS']);
      expect(blankTestArea.occupantIDs).toStrictEqual(['occupant1']);
      expect(blankTestArea.mainPlayer).toEqual('occupant1');

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual(blankTestArea.toModel());
    });
    it('Calculates the proper score before solution has been accurately guessed', () => {
      newModel.guessHistory = ['AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(0);

      newModel.guessHistory = ['SAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(25);
      newModel.guessHistory = ['GAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(50);
      newModel.guessHistory = ['GAAAS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(100);
      newModel.guessHistory = ['GAAAs'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(50);
      newModel.guessHistory = ['GAAAA', 'SAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(75);
    });
    it('Calculates the proper score after solution has been accurately guessed', () => {
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(2000);

      newModel.guessHistory = ['AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(1500);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(1000);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(500);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(250);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(150);

      newModel.guessHistory = ['PARSE', 'GHAST', 'GUEST', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.currentScore).toBe(875);
    });
    it('Does not set isWon to true before win condition is reached', () => {
      newModel.guessHistory = ['AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);

      newModel.guessHistory = ['guess'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);
    });
    it('Does set isWon to true when win condition is reached', () => {
      newModel.guessHistory = ['GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(true);

      newModel.guessHistory = ['AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(true);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(true);
    });
    it('Does not set isLost to true before lose condition is reached', () => {
      newModel.guessHistory = ['AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isLost).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isLost).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isLost).toBe(false);

      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'GUESS'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isLost).toBe(false);
    });
    it('Does set isLost to true when lose condition is reached', () => {
      newModel.guessHistory = ['AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA', 'AAAAA'];
      blankTestArea.updateModel(newModel);
      expect(blankTestArea.isWon).toBe(false);
    });
  });
  test('toModel returns the ID, isPlaying, currentScore, and guessHistory', () => {
    const model = testArea.toModel();
    const occupantIDs = testArea.occupantsByID;
    expect(model).toEqual({
      id,
      isPlaying,
      currentScore,
      guessHistory,
      solution: testArea.solution,
      isWon: false,
      isLost: false,
      mainPlayer: testArea.mainPlayer,
      occupantIDs,
    });
  });
});
