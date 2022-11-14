import { Center, HStack, Text, VStack } from '@chakra-ui/react';
import React from 'react';

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

interface TileProps {
  letter: string;
  color: string;
  order?: number;
}

function Tile({ letter, color }: TileProps): JSX.Element {
  return (
    <Center
      w={['50px', '55px', '60px']}
      h={['50px', '55px', '60px']}
      border='1px'
      backgroundColor={color}
      borderColor='gray.700'
      userSelect='none'>
      <Text fontWeight={700} fontSize='x-large'>
        {letter.toUpperCase()}
      </Text>
    </Center>
  );
}

function EmptyTile({ showCursor }: { showCursor?: boolean }): JSX.Element {
  return (
    <Center
      w={['50px', '55px', '60px']}
      h={['50px', '55px', '60px']}
      border='1px'
      borderColor={'gray.700'}
      userSelect='none'>
      {showCursor && <Text fontSize='x-large'>_</Text>}
    </Center>
  );
}

function Row({ guess }: RowProps): JSX.Element {
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
}

export default function Board({ guesses }: BoardProps): JSX.Element {
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
}
