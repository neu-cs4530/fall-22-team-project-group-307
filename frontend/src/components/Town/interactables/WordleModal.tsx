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
  Box,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useWordleAreaController } from '../../../classes/TownController';
import { WordleArea as WordleAreaModel } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import WordleAreaInteractable from './WordleArea';

export function WordleAreaModal({
  isOpen,
  close,
  wordleArea,
}: {
  isOpen: boolean;
  close: () => void;
  wordleArea: WordleAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();

  useEffect(() => {
    if (wordleArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, wordleArea]);

  const closeModal = useCallback(() => {
    if (wordleArea) {
      close();
      coveyTownController.interactEnd(wordleArea);
      coveyTownController.unPause();
    }
  }, [close, coveyTownController, wordleArea]);

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

/**
 * The WordleArea monitors the player's interaction with a WordleArea on the map: displaying either
 * a popup to set the video for a wordle area, or if the video is set, a video player.
 *
 * @param props: the wordle area interactable that is being interacted with
 */
export function WordleArea({ wordleArea }: { wordleArea: WordleAreaInteractable }): JSX.Element {
  const townController = useTownController();
  const wordleAreaController = useWordleAreaController(wordleArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(!wordleAreaController.isPlaying);
  const [isPlaying, setIsPlaying] = useState(wordleAreaController.isPlaying);
  useEffect(() => {
    const setPlaying = (newIsPlaying: boolean) => {
      if (!newIsPlaying) {
        townController.interactableEmitter.emit('endIteraction', wordleAreaController);
      } else {
        setIsPlaying(newIsPlaying);
      }
    };
    wordleAreaController.addListener('playingChange', setPlaying);
    return () => {
      wordleAreaController.removeListener('playingChange', setPlaying);
    };
  }, [wordleAreaController, townController]);

  if (!isPlaying) {
    return (
      <WordleAreaModal
        isOpen={selectIsOpen}
        close={() => setSelectIsOpen(false)}
        wordleArea={wordleArea}
      />
    );
  }
  return (
    <Box bg='tomato' w='100%' p={4} color='white'>
      This is the Box
    </Box>
  );
}

/**
 * The WordleAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a wordle area.
 */
export default function WordleAreaWrapper(): JSX.Element {
  const wordleArea = useInteractable<WordleAreaInteractable>('wordleArea');
  if (wordleArea) {
    return <WordleArea wordleArea={wordleArea} />;
  }
  return <></>;
}
