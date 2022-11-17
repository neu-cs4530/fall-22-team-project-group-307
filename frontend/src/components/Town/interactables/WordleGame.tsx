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
import { default as React, useEffect, useState } from 'react';
import { useWordleAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import WordleAreaInteractable from './WordleArea';
import Board from './WordleBoard';
import _ from 'lodash';

export default function WordleGame({
  wordleArea,
  closeGame,
}: {
  wordleArea: WordleAreaInteractable;
  closeGame: () => void;
}): JSX.Element {
  const coveyTownController = useTownController();
  const wordleAreaController = useWordleAreaController(wordleArea.name);

  const [guessHistory, setGuessHistory] = useState(wordleAreaController.guessHistory);

  const [input, setInput] = useState('');
  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) =>
    setInput(e.target.value);

  const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
  const isSymbolError = specialCharacters.test(input);
  const isLengthError = input.length != 5;

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

  const toast = useToast();

  const handleSubmit = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const guess: string = ev.currentTarget.value;
    if (ev.key === 'Enter') {
      if (!isLengthError && !isSymbolError) {
        const inWordList = true; // TODO: Actually check to see if guess is in word list
        if (inWordList) {
          setGuessHistory([...guessHistory, guess]);
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

  if (_.includes(guessHistory, 'guess') || guessHistory.length >= 6) {
    const boxColor = _.includes(guessHistory, 'guess') ? 'green' : 'tomato';
    const boxText = _.includes(guessHistory, 'guess') ? 'You won!' : 'You Lost.';
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
              <Box bg={boxColor} w='100%' p={4} color='white'>
                {boxText}
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
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
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
}
