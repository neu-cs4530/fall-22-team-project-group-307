import ENG_FIVE_ALL from './ENG-5-ALL';
import ENG_FIVE_POOL from './ENG-5-POOL';

class DataAccess {
  private static _instance: DataAccess;

  private _eng5PoolFile = 'ENG-5-POOL.txt';

  private _eng5Pool: string[];

  private _eng5AllFile = 'ENG-5-ALL.txt';

  private _eng5All: string[];

  private constructor() {
    this._eng5Pool = JSON.parse(ENG_FIVE_POOL);
    this._eng5All = JSON.parse(ENG_FIVE_ALL);
  }

  public static getAccess(): DataAccess {
    if (!DataAccess._instance) {
      DataAccess._instance = new DataAccess();
    }

    return DataAccess._instance;
  }

  public isValidWord(word: string, restricted = false) {
    word = word.toLowerCase();
    switch (word.length) {
      case 5:
        return restricted ? this._eng5Pool.includes(word) : this._eng5All.includes(word);
      default:
        throw new Error(`Coverage for words of length ${word.length} is unsupported`);
    }
  }

  public getValidWord(length: number, restricted = false) {
    const wordExtractor = (wordlist: string[]) => {
      const randomIdx = Math.floor(Math.random() * wordlist.length);
      return wordlist[randomIdx];
    };

    switch (length) {
      case 5:
        return restricted ? wordExtractor(this._eng5Pool) : wordExtractor(this._eng5All);
      default:
        throw new Error(`Coverage for words of length ${length} is unsupported`);
    }
  }
}

export default DataAccess;
