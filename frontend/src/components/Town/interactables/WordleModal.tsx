import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useWordleAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { WordleArea as WordleAreaModel } from '../../../types/CoveyTownSocket';
import WordleAreaInteractable from './WordleArea';
import WordleGame from './WordleGame';

export function CreateWordleModal({
  isOpen,
  wordleArea,
}: {
  isOpen: boolean;
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
      coveyTownController.interactEnd(wordleArea);
      coveyTownController.unPause();
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
        solution: '',
        isWon: false,
        isLost: false,
        occupantIDs: [],
        mainPlayer: coveyTownController.ourPlayer.id,
      };
      try {
        await coveyTownController.createWordleArea(wordleToCreate);
        toast({
          title: 'Wordle Created!',
          status: 'success',
        });
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
  }, [wordleArea, coveyTownController, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
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
 * a popup to start wordle game, or if the game is already being played, the wordle game itself.
 *
 * @param props: the wordle area interactable that is being interacted with
 */
export function WordleArea({ wordleArea }: { wordleArea: WordleAreaInteractable }): JSX.Element {
  const townController = useTownController();
  const wordleAreaController = useWordleAreaController(wordleArea.name);
  const [isPlaying, setIsPlaying] = useState(wordleAreaController.isPlaying);

  if (wordleAreaController) {
    wordleAreaController.toWordleAreaModel();
  }

  const closeModal = useCallback(() => {
    if (wordleArea) {
      townController.interactEnd(wordleArea);
      townController.unPause();
    }
  }, [townController, wordleArea]);

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

  // if the isPlaying property of the WordleArea in question is false, return the select modal instead
  if (!isPlaying) {
    return <CreateWordleModal isOpen={!isPlaying} wordleArea={wordleArea} />;
  }

  //if true, then return the component representing the actual Wordle game
  return (
    <WordleGame
      wordleArea={wordleArea}
      wordleAreaController={wordleAreaController}
      closeGame={closeModal}
    />
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
