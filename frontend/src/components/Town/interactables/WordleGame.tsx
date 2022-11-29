import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import { default as React, useEffect, useState } from 'react';
import WordleAreaController from '../../../classes/WordleAreaController';
import useTownController from '../../../hooks/useTownController';
import WordleAreaInteractable from './WordleArea';
import Board from './WordleBoard';
import DataAccess from '../../../data/DataAccess';

/**
 * Renders a modal representing the actual game of Wordle including the board and input box.
 *
 * Renders a new win/loss screen upon completion of game.
 * If viewing player is a spectator, does not allow for guess submission or abiliity to restart.
 *
 * @prop {WordleAreaInteractable} wordleArea - interactable representing the associated wordle area.
 * @prop {WordleAreaController} wordleAreaController - controller representing the associated wordle area.
 * @prop {() => void} closeGame - function to call when closing modal housing the game.
 * @returns the modal representing the game.
 */
export default function WordleGame({
  wordleArea,
  wordleAreaController,
  closeGame,
}: {
  wordleArea: WordleAreaInteractable;
  wordleAreaController: WordleAreaController;
  closeGame: () => void;
}): JSX.Element {
  const coveyTownController = useTownController();
  const [guessHistory, setGuessHistory] = useState(wordleAreaController.guessHistory);

  const [input, setInput] = useState('');
  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) =>
    setInput(e.target.value);

  const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
  const numberCharacters = /[0-9]/;
  const isSymbolError = specialCharacters.test(input);
  const isNumberError = numberCharacters.test(input);
  const isLengthError = input.length != 5;

  useEffect(() => {
    const setHistory = (newHistory: string[]) => {
      if (newHistory !== guessHistory) {
        console.log(newHistory);
        setGuessHistory(newHistory);
      }
    };
    wordleAreaController.addListener('historyChange', setHistory);
    return () => {
      wordleAreaController.removeListener('historyChange', setHistory);
    };
  }, [wordleAreaController, guessHistory]);

  useEffect(() => {
    if (wordleArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, wordleArea]);

  const toast = useToast();

  const handleSubmit = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const guess: string = ev.currentTarget.value;
    if (ev.key === 'Enter') {
      if (isSymbolError || isNumberError) {
        toast({
          title: 'Guess cannot contain symbols or numbers',
          status: 'error',
          duration: 1000,
        });
      }
      if (isLengthError) {
        toast({
          title: 'Too short - a guess must be 5 characters',
          status: 'error',
          duration: 1000,
        });
      }

      if (!isLengthError && !isSymbolError && !isNumberError) {
        const inWordList = true; // TODO: Actually check to see if guess is in word list
        if (inWordList) {
          wordleAreaController.guessHistory = [...guessHistory, guess];
          coveyTownController.emitWordleAreaUpdate(wordleAreaController);
          setInput('');
          ev.currentTarget.value = '';
        } else {
          toast({
            title: 'Guess not in word list',
            status: 'error',
            duration: 1000,
          });
        }
      } else {
        toast({
          title: 'Guess not in word list',
          status: 'error',
          duration: 1000,
        });
      }
    }
  };

  const handleReset = () => {
    // TODO: Will need to reset score here
    wordleAreaController.guessHistory = [];
    coveyTownController.emitWordleAreaUpdate(wordleAreaController);
  };

  // initialize default values for game components
  // assuming current view is mainPlayer and game has not been won or lost yet
  let winLossDisplay: JSX.Element = <></>;
  let winLossButtons: JSX.Element = <></>;
  let gameBoard: JSX.Element = <Board guesses={guessHistory} />;
  let inputBox: JSX.Element = (
      <FormControl isInvalid={isSymbolError || isNumberError}>
      <Input
        maxLength={5}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleSubmit}
        errorBorderColor='red.300'
      />
      {!isSymbolError ? (
        isNumberError ? (
          <FormErrorMessage>A guess cannot contain numbers.</FormErrorMessage>
        ) : (
          <FormHelperText>Happy guessing!</FormHelperText>
        )
      ) : (
        <FormErrorMessage>A guess cannot contain symbols.</FormErrorMessage>
      )}
    </FormControl>
  );

  // if spectator, removes inputBox
  const isMainPlayer = coveyTownController.ourPlayer.id === wordleAreaController.mainPlayer;
  if (!isMainPlayer) {
    inputBox = <></>;
  }

  // if win/loss condition has been satisified, removes gameBoard, inputBox and renders winLossDisplay, winLossButtons*
  // if spectator, removes playAgainButton
  if (_.includes(guessHistory, solution) || guessHistory.length >= 6) {
    const boxColor = _.includes(guessHistory, solution) ? 'green' : 'tomato';
    const boxText = _.includes(guessHistory, solution)
      ? `${isMainPlayer ? 'You' : mainPlayerName} won! :)`
      : `${isMainPlayer ? 'You' : mainPlayerName} lost. :(`;

    winLossDisplay = (
      <Box bg={boxColor} w='100%' p={4} color='white'>
        {boxText}
      </Box>
    );

    const playAgainButton: JSX.Element = (
      <Button mr={3} onClick={handleReset}>
        Play Again
      </Button>
    );

    winLossButtons = (
      <ModalFooter mt={0} pt={1}>
        {isMainPlayer ? playAgainButton : <></>}
        <Button colorScheme='blue' onClick={closeGame}>
          Exit
        </Button>
      </ModalFooter>
    );
  } else {
    return (
      <Modal isOpen={true} onClose={closeGame}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{wordleArea?.name} </ModalHeader>
          <ModalBody mb={5}>
            <Flex
              mb={4}
              flexDir='column'
              height='100%'
              overflow={'hidden'}
              alignItems='center'
              justifyContent='space-evenly'>
              <Board guesses={guessHistory} />
            </Flex>
            <FormControl isInvalid={isSymbolError || isNumberError}>
              <Input
                maxLength={5}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleSubmit}
                errorBorderColor='red.300'
              />
              {!isSymbolError ? (
                isNumberError ? (
                  <FormErrorMessage>A guess cannot contain numbers.</FormErrorMessage>
                ) : (
                  <FormHelperText>Happy guessing!</FormHelperText>
                )
              ) : (
                <FormErrorMessage>A guess cannot contain symbols.</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
}
