import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import { default as React, useEffect, useState } from 'react';
import { usePlayers } from '../../../classes/TownController';
import WordleAreaController from '../../../classes/WordleAreaController';
import useTownController from '../../../hooks/useTownController';
import WordleAreaInteractable from './WordleArea';
import Board from './WordleBoard';

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
  const isSymbolError = specialCharacters.test(input);
  const isLengthError = input.length != 5;

  const toast = useToast();
  const solution = 'guess'; // TODO: Actually generate a random solution instead of hardcoding
  const mainPlayerController = usePlayers().find(
    eachPlayer => eachPlayer.id === wordleAreaController.mainPlayer,
  );
  const mainPlayerName = mainPlayerController
    ? mainPlayerController.userName
    : 'ERROR: Main player not found';

  useEffect(() => {
    const setHistory = (newHistory: string[]) => {
      if (newHistory !== guessHistory) {
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

  // checks validity of guess submitted from KeyboardEvent, submits to guessHistory if valid
  const handleSubmit = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const guess: string = ev.currentTarget.value;
    if (ev.key === 'Enter') {
      if (!isLengthError && !isSymbolError) {
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
          title: 'Invalid guess - try again',
          status: 'error',
          duration: 1000,
        });
      }
    }
  };

  // initialize default values for game components
  // assuming current view is mainPlayer and game has not been won or lost yet
  let winLossDisplay: JSX.Element = <></>;
  let gameBoard: JSX.Element = <Board guesses={guessHistory} />;
  let inputBox: JSX.Element = (
    <FormControl isInvalid={isSymbolError}>
      <Input
        maxLength={5}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleSubmit}
        errorBorderColor='red.300'
      />
      {!isSymbolError ? (
        isLengthError ? (
          <FormHelperText>A Wordle is five characters long.</FormHelperText>
        ) : (
          <FormHelperText>Happy guessing!</FormHelperText>
        )
      ) : (
        <FormErrorMessage>A guess cannot contain symbols.</FormErrorMessage>
      )}
    </FormControl>
  );

  // if spectator, removes inputBox
  const isMainPlayer = coveyTownController.ourPlayer.id !== wordleAreaController.mainPlayer;
  if (isMainPlayer) {
    inputBox = <></>;
  }

  // if win/loss condition has been satisified, removes gameBoard, inputBox and renders winLossDisplay
  if (_.includes(guessHistory, solution) || guessHistory.length >= 6) {
    const boxColor = _.includes(guessHistory, solution) ? 'green' : 'tomato';
    const boxText = _.includes(guessHistory, solution)
      ? `${isMainPlayer ? mainPlayerName : 'You'} won! :)`
      : `${isMainPlayer ? mainPlayerName : 'You'} lost. :(`;

    winLossDisplay = (
      <Box bg={boxColor} w='100%' p={4} color='white'>
        {boxText}
      </Box>
    );
    gameBoard = <></>;
    inputBox = <></>;
  }

  return (
    <Modal isOpen={true} onClose={closeGame}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          {mainPlayerName}&apos;s {wordleArea?.name}{' '}
        </ModalHeader>
        <ModalBody mb={5}>
          <Flex
            mb={4}
            flexDir='column'
            height='100%'
            overflow={'hidden'}
            alignItems='center'
            justifyContent='space-evenly'>
            {gameBoard}
            {winLossDisplay}
          </Flex>
          {inputBox}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
