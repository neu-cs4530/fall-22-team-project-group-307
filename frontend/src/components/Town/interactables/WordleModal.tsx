import {
  Modal,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  ModalFooter,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { WordleArea as WordleAreaModel } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';

export default function WordleModal(): JSX.Element {
  const coveyTownController = useTownController();
  const wordleArea = useInteractable('wordleArea');

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
        <ModalCloseButton />
        <ModalHeader>{wordleArea?.name} </ModalHeader>
        <ModalBody>Would you like to start a game of Wordle in this area?</ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={createWordle}>
            Create
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
