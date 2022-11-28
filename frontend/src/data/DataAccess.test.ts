import DataAccess from './DataAccess';
import ENG_FIVE_ALL from './ENG-5-ALL';
import ENG_FIVE_POOL from './ENG-5-POOL';

describe('DataAccess', () => {
  let access: DataAccess;
  const poolList: string[] = JSON.parse(ENG_FIVE_POOL);
  const allList: string[] = JSON.parse(ENG_FIVE_ALL);

  beforeEach(() => {
    access = DataAccess.getAccess();
  });

  describe('isValidWord', () => {
    it('Returns true for pool words while restricted parameter is true', () => {
      for (let i = 0; i < poolList.length; i++) {
        expect(access.isValidWord(poolList[i], true)).toBeTruthy();
      }
    });
    it('Returns true for pool words while restricted parameter is false', () => {
      for (let i = 0; i < poolList.length; i++) {
        expect(access.isValidWord(poolList[i])).toBeTruthy();
      }
    });
    it('Returns true for all words while restricted parameter is false', () => {
      for (let i = 0; i < allList.length; i++) {
        expect(access.isValidWord(allList[i])).toBeTruthy();
      }
    });
    it('Returns false for an all-but-not-pool word while restricted parameter is true', () => {
      expect(access.isValidWord('AAHED')).toBeTruthy();
      expect(access.isValidWord('AAHED', true)).toBeFalsy();
    });
    it('Returns false for invalid words', () => {
      expect(access.isValidWord('IDDQD', true)).toBeFalsy();
      expect(access.isValidWord('IDDQD', false)).toBeFalsy();
    });
    it('Throws error for invalid word length', () => {
      expect(() => access.isValidWord('HUH', true)).toThrowError();
      expect(() => access.isValidWord('HUH')).toThrowError();
    });
  });

  describe('getValidWord', () => {
    it('Returns a valid word of specified length', () => {
      const retrievedPoolWord = access.getValidWord(5, true);
      expect(retrievedPoolWord.length).toEqual(5);
      const retrievedAllWord = access.getValidWord(5);
      expect(retrievedAllWord.length).toEqual(5);
    });
    it('Throws error for invalid word length', () => {
      expect(() => access.getValidWord(4, true)).toThrowError();
      expect(() => access.getValidWord(4)).toThrowError();
    });
  });
});
