import { HStack, VStack } from '@chakra-ui/react';
import React from 'react';
import { EmptyTile, Tile } from './WordleTile';

interface GuessLetter {
  letter: string;
  color: string;
}

interface BoardProps {
  guesses: string[];
}

interface RowProps {
  guess?: GuessLetter[] | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Row = ({ guess }: RowProps) => {
  // if there's no guess, return a row of empty tiles
  if (guess === undefined) {
    return (
      <HStack>
        <EmptyTile />
        <EmptyTile />
        <EmptyTile />
        <EmptyTile />
        <EmptyTile />
      </HStack>
    );
  }

  // if there is a guess, populate and color
  return (
    <HStack>
      {guess.map((letterObject, index) => (
        <Tile key={index} letter={letterObject.letter} color={letterObject.color} />
      ))}
    </HStack>
  );
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const Board = ({ guesses }: BoardProps) => {
  //TODO: add solution property to WordleArea so this isn't hard coded
  const solutionArray = [...'guess'];

  const convertGuess = (toConvert: string | undefined) => {
    // if a row hasn't been guessed yet, return a blank row
    if (toConvert === undefined) {
      const result: GuessLetter[] = [];
      solutionArray.forEach(() => {
        result.push({
          letter: '',
          color: 'gray',
        });
      });
      return result;
    }
    const converted: GuessLetter[] = [...toConvert].map((character, i) => {
      // color check
      let color = 'gray'; // default color
      if (character.toLowerCase() == solutionArray[i]) {
        color = 'green'; // letter in correct spot
      } else if (solutionArray.includes(character.toLowerCase())) {
        color = 'yellow'; // letter is part of the word, but not in the correct spot
      }

      return {
        letter: character.toLowerCase(),
        color: color,
      };
    });

    return converted;
  };

  // iterate through each guess and convert it to a GuessLetter
  const allFormattedGuesses = Array<GuessLetter[]>(6).fill(convertGuess(undefined));
  guesses.map((eachGuess, i) => {
    allFormattedGuesses[i] = convertGuess(eachGuess);
  });

  return (
    <VStack>
      {allFormattedGuesses.map((guess, index) => {
        return <Row key={index} guess={guess} />;
      })}
    </VStack>
  );
};

export default Board;
