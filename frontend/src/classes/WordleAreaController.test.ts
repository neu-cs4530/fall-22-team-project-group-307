import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { WordleArea } from '../generated/client';
import { PlayerLocation, WordleArea as WordleAreaBig } from '../types/CoveyTownSocket';
import PlayerController from './PlayerController';
import TownController from './TownController';
import WordleAreaController, { WordleAreaEvents } from './WordleAreaController';

describe('WordleAreaController', () => {
  // A valid WordleAreaController to be reused within the tests
  let testArea: WordleAreaController;
  let testAreaModel: WordleAreaBig;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<WordleAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      isPlaying: false,
      currentScore: 0,
      guessHistory: [],
      solution: 'RIGHT',
      isWon: false,
      isLost: false,
      isValidGuess: testArea.isValidGuess,
      occupantIDs: [],
      mainPlayer: nanoid(),
    };
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testArea = new WordleAreaController(testAreaModel);
    testArea.occupants = [
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
    ];
    testAreaModel.occupantIDs = testArea.occupants.map(player => player.id);
    mockClear(townController);
    mockClear(mockListeners.scoreChange);
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.playingChange);
    mockClear(mockListeners.historyChange);
    testArea.addListener('scoreChange', mockListeners.scoreChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('playingChange', mockListeners.playingChange);
    testArea.addListener('historyChange', mockListeners.historyChange);
  });
  describe('Setting guess history property', () => {
    it('updates the property and emits a historyChange event if the property changes', () => {
      const newHistory = ['silly'];
      testArea.guessHistory = newHistory;
      expect(mockListeners.historyChange).toBeCalledWith(newHistory);
      expect(testArea.guessHistory).toEqual(newHistory);
    });
    it('does not emit a historyChange event if the guess history property does not change', () => {
      testArea.guessHistory = testAreaModel.guessHistory;
      expect(mockListeners.historyChange).not.toBeCalled();
    });
  });
  describe('Setting score property', () => {
    it('updates the model and emits a scoreChange event if the property changes', () => {
      const newScore = testArea.score + 1;
      testArea.score = newScore;
      expect(mockListeners.scoreChange).toBeCalledWith(newScore);
      expect(testArea.score).toEqual(newScore);
    });
    it('does not emit a scoreChange event if the score property does not change', () => {
      testArea.score = testAreaModel.currentScore;
      expect(mockListeners.scoreChange).not.toBeCalled();
    });
  });
  describe('setting the occupants property', () => {
    it('does not update the property if the new occupants are the same set as the old', () => {
      const origOccupants = testArea.occupants;
      const occupantsCopy = testArea.occupants.concat([]);
      const shuffledOccupants = occupantsCopy.reverse();
      testArea.occupants = shuffledOccupants;
      expect(testArea.occupants).toEqual(origOccupants);
      expect(mockListeners.occupantsChange).not.toBeCalled();
    });
    it('emits the occupantsChange event when setting the property and updates the model', () => {
      const newOccupants = testArea.occupants.slice(1);
      testArea.occupants = newOccupants;
      expect(testArea.occupants).toEqual(newOccupants);
      expect(mockListeners.occupantsChange).toBeCalledWith(newOccupants);
      expect(testArea.toWordleAreaModel()).toEqual({
        id: testArea.id,
        isPlaying: testArea.isPlaying,
        currentScore: testArea.score,
        guessHistory: testArea.guessHistory,
        isWon: testArea.isGameWon,
        isLost: testArea.isGameLost,
        occupantIDs: testArea.occupants.map(eachOccupant => eachOccupant.id),
        mainPlayer: testAreaModel.mainPlayer,
      });
    });
  });
  describe('Setting isPlaying property', () => {
    it('updates the model and emits a playbackChange event if the property changes', () => {
      const newValue = !testAreaModel.isPlaying;
      testArea.isPlaying = newValue;
      expect(mockListeners.playingChange).toBeCalledWith(newValue);
      expect(testArea.isPlaying).toEqual(newValue);
    });
    it('does not emit a playbackChange event if the isPlaying property does not change', () => {
      const existingValue = testAreaModel.isPlaying;
      testArea.isPlaying = existingValue;
      expect(mockListeners.playingChange).not.toBeCalled();
    });
  });
  describe('toWordleAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.toWordleAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates all properties except id', () => {
      const newModel: WordleArea = {
        id: testAreaModel.id,
        isPlaying: true,
        currentScore: 0,
        guessHistory: ['guess'],
        isWon: true,
        isLost: true,
        occupantIDs: [nanoid()],
        mainPlayer: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.isPlaying).toEqual(newModel.isPlaying);
      expect(testArea.score).toEqual(newModel.currentScore);
      expect(testArea.guessHistory).toEqual(newModel.guessHistory);
      expect(testArea.isGameWon).toEqual(newModel.isWon);
      expect(testArea.isGameLost).toEqual(newModel.isLost);
      expect(testArea.mainPlayer).toEqual(newModel.mainPlayer);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: WordleAreaBig = {
        id: nanoid(),
        isPlaying: true,
        currentScore: 0,
        guessHistory: ['guess'],
        isWon: true,
        isLost: false,
        occupantIDs: [],
        mainPlayer: nanoid(),
        solution: 'right',
        isValidGuess: testAreaModel.isValidGuess,
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
