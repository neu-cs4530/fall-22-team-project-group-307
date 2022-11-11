import * as fs from 'fs';
import * as rl from 'readline';

class DataAccess {
  private static _initialized = false;

  private static _eng5PoolFile = 'ENG-5-POOL.txt';

  private static _eng5Pool: string[];

  private static _eng5AllFile = 'ENG-5-ALL.txt';

  private static _eng5All: string[];

  private static async _initialize() {
    async function _initializeWordlist(fileName: string): Promise<string[]> {
      const newList: string[] = [];
      const file = fs.createReadStream(`data/${fileName}`);
      const reader = rl.createInterface({
        input: file,
      });

      for await (const line of reader) {
        newList.push(line);
      }

      return newList;
    }

    async function _setWordlists(): Promise<void> {
      DataAccess._eng5Pool = await _initializeWordlist(DataAccess._eng5PoolFile);
      DataAccess._eng5All = await _initializeWordlist(DataAccess._eng5AllFile);
    }

    await _setWordlists();
    this._initialized = true;
  }

  public static async isValidWord(word: string, restricted = false) {
    if (!this._initialized) {
      await this._initialize();
    }

    word = word.toLowerCase();
    switch (word.length) {
      case 5:
        return restricted
          ? DataAccess._eng5Pool.includes(word)
          : DataAccess._eng5All.includes(word);
      default:
        throw new Error(`Coverage for words of length ${word.length} is unsupported`);
    }
  }

  public static async getValidWord(length: number, restricted = false) {
    if (!this._initialized) {
      await this._initialize();
    }

    const wordExtractor = (wordlist: string[]) => {
      const randomIdx = Math.floor(Math.random() * wordlist.length);
      return wordlist[randomIdx];
    };

    switch (length) {
      case 5:
        return restricted
          ? wordExtractor(DataAccess._eng5Pool)
          : wordExtractor(DataAccess._eng5All);
      default:
        throw new Error(`Coverage for words of length ${length} is unsupported`);
    }
  }
}

export default DataAccess;
