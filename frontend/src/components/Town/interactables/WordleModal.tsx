import {
  Modal,
  Button,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { WordleArea as WordleAreaModel } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import WordleAreaInteractable from './WordleArea';

function WordleModal({ wordleArea }: { wordleArea: WordleAreaInteractable }): JSX.Element {
  const coveyTownController = useTownController();

  const isOpen = wordleArea !== undefined;

  useEffect(() => {
    if (wordleArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, wordleArea]);

  const closeModal = useCallback(() => {
    if (wordleArea) {
      coveyTownController.interactEnd(wordleArea);
    }
  }, [coveyTownController, wordleArea]);

  const toast = useToast();

  const createWordle = useCallback(async () => {
    if (wordleArea) {
      const wordleToCreate: WordleAreaModel = {
        id: wordleArea.name,
        isPlaying: true,
        currentScore: 0,
        guessHistory: [],
      };
      try {
        await coveyTownController.createWordleArea(wordleToCreate);
        toast({
          title: 'Wordle Created!',
          status: 'success',
        });
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create wordle',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [coveyTownController, wordleArea, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a wordle in {wordleArea?.name} </ModalHeader>
        <ModalCloseButton />
        <Button colorScheme='blue' mr={3} onClick={createWordle}>
          Create
        </Button>
      </ModalContent>
    </Modal>
  );
}

export default function WordleModalWrapper(): JSX.Element {
  const wordleArea = useInteractable<WordleAreaInteractable>('wordleArea');
  if (wordleArea) {
    console.log('Something is right....');
    return <WordleModal wordleArea={wordleArea} />;
  }
  console.log('Something aint right.');
  return <></>;
}
