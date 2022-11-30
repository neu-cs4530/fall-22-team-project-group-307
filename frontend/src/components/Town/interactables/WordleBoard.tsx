import { Center, HStack, keyframes, Text, VStack } from '@chakra-ui/react';
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

// the border color as well as the gray color
const DEFAULT_GREY = 'gray.700';

/**
 * Renders a component representing a populated tile in a game of Wordle.
 *
 * @prop {string} letter - letter of the tile.
 * @prop {string} color - color of the tile.
 * @returns {JSX.Element} the component representing the tile.
 */
function Tile({ letter, color, order }: TileProps): JSX.Element {
  // the flip animation, specifying the state of the tile at certain degrees of turn
  const flip = keyframes`
    0% {
      transform: rotateX(0);
      background-color: transparent;
      border-color: ${DEFAULT_GREY};
    }
    45% {
      transform: rotateX(90deg);
      background-color: transparent;
      border-color: ${DEFAULT_GREY}
    }
    55% {
      transform: rotateX(90deg);
      background-color: ${color};
      border-color: ${DEFAULT_GREY};
    }
    100% {
      transform: rotateX(0);
      background-color: ${color};
      border-color: ${DEFAULT_GREY};
  }`;

  // initiate animation as undefined
  let animation = undefined;

  // a color assignment indicates the user has pressed ENTER, so assign animation
  if (color === 'gray' || color === 'green' || color === 'yellow') {
    animation = `${flip} 0.8s ease`;
  }

  // animation delay so tiles don't animate simultaneously
  let delay = undefined;
  if (order) {
    delay = `${0.4 * order}s`;
  }

  // return a tile with the given animation to change its background
  return (
    <Center
      w={['60px', '60px', '60px']}
      h={['60px', '60px', '60px']}
      border='1px'
      borderColor={DEFAULT_GREY}
      animation={animation}
      userSelect='none'
      sx={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      <Text fontWeight={750} fontSize='3xl'>
        {letter.toUpperCase()}
      </Text>
    </Center>
  );
}

/**
 * Renders a component representing an empty tile in a game of Wordle.
 *
 * @prop {boolean} showCursor - flag for... TODO
 * @returns {JSX.Element} the component representing the tile.
 */
function EmptyTile({ showCursor }: { showCursor?: boolean }): JSX.Element {
  return (
    <Center
      w={['60px', '60px', '60px']}
      h={['60px', '60px', '60px']}
      border='1px'
      borderColor={DEFAULT_GREY}
      userSelect='none'>
      {showCursor && <Text fontSize='x-large'>_</Text>}
    </Center>
  );
}

/**
 * Renders a row of tiles representing the supplied guess.
 * If supplied guess is undefined, returns a row of empty tiles.
 *
 * @prop {GuessLetter[] | undefined} guess - the letters that comprise the guess.
 * @returns the component.
 */
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
        <Tile key={index} letter={letterObject.letter} color={letterObject.color} order={index} />
      ))}
    </HStack>
  );
}

/**
 * Renders a grid of tiles representing the game board.
 * Guesses render in proper color based on proximity to solution
 *
 * @prop {string[]} guesses - the guesses made by the player so far.
 * @returns the component.
 */
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
          color: 'transparent',
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
