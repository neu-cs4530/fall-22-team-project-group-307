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
  const solutionArray = [...'GUESS']; // whenever this gets changed can we make the sol uppercase (will change backend to reflect this) -victor

  const convertGuess = (toConvert: string | undefined) => {
    const converted: GuessLetter[] = new Array(5);

    // if a row hasn't been guessed yet, return a blank row
    if (toConvert === undefined) {
      solutionArray.forEach(() => {
        converted.push({
          letter: '',
          color: 'gray',
        });
      });
      return converted;
    }

    const answer = solutionArray.map(letter => letter);
    const guess = [...toConvert.toUpperCase()];

    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) {
        converted[i] = {
          letter: guess[i],
          color: 'green',
        };
        guess[i] = ' ';
        answer[i] = ' ';
      }
    }

    for (let i = 0; i < 5; i++) {
      const yellowMatch = answer.indexOf(guess[i]);
      if (guess[i] !== ' ' && yellowMatch !== -1) {
        converted[i] = {
          letter: guess[i],
          color: 'yellow',
        };
        guess[i] = ' ';
        answer[yellowMatch] = ' ';
      }
    }

    for (let i = 0; i < 5; i++) {
      if (guess[i] !== ' ') {
        converted[i] = {
          letter: guess[i],
          color: 'gray',
        };
      }
    }

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
