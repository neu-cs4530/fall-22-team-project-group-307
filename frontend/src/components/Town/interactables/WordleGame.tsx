import {
  Flex,
  FormControl,
  FormLabel,
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
  const [currGuess, setCurrGuess] = React.useState('');

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
      if (guess.length == 5) {
        const inWordList = true; // TODO: Actually check to see if guess is in word list
        if (inWordList) {
          setGuessHistory([...guessHistory, guess]);
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
          title: 'Guess not long enough!',
          status: 'error',
          duration: 1000,
        });
      }
    }
  };

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
          <FormControl>
            <FormLabel>history: {guessHistory}</FormLabel>
            <Input maxLength={5} placeholder='Input guess here!' onKeyDown={handleSubmit} />
          </FormControl>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
