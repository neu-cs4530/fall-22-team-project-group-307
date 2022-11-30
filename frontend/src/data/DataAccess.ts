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

  /**
   * Gets the singleton for this class.
   * @returns the DataAccess object
   */
  public static getAccess(): DataAccess {
    if (!DataAccess._instance) {
      DataAccess._instance = new DataAccess();
    }

    return DataAccess._instance;
  }

  /**
   * Checks if the specified text is a valid English word.
   * @param word the text to check
   * @param restricted if the word should be contained in the "restricted" pool (i.e. more common words)
   * @returns whether the text is an English word
   */
  public isValidWord(word: string, restricted = false) {
    word = word.toUpperCase();
    switch (word.length) {
      case 5:
        return restricted ? this._eng5Pool.includes(word) : this._eng5All.includes(word);
      default:
        throw new Error(`Coverage for words of length ${word.length} is unsupported`);
    }
  }

  /**
   * Retrieves a random English word of the specified length.
   * @param length the requested word length
   * @param restricted if the word should originate from the "restricted" pool (i.e. more common words)
   * @returns a random English word
   */
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
