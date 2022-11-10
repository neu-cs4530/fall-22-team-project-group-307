import * as fs from 'fs';
import * as rl from 'readline';

class DataAccess {
  private static _instance: DataAccess;

  private static _eng5PoolFile = '';

  private static _eng5Pool: string[];

  private static _eng5AllFile = '';

  private static _eng5All: string[];

  private constructor() {
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

    _setWordlists();
  }

  public static getInstance(): DataAccess {
    if (!DataAccess._instance) {
      DataAccess._instance = new DataAccess();
    }

    return DataAccess._instance;
  }

  public static isValidWord(word: string, restricted = false) {
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

  public static getValidWord(length: number, restricted = false) {
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
