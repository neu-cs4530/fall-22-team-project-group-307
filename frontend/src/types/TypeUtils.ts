import { ConversationArea, Interactable, WordleArea, ViewingArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'elapsedTimeSec' in interactable;
}

/**
 * Test to see if an interactable is a wordle area
 */
export function isWordleArea(interactable: Interactable): interactable is WordleArea {
  return 'guessHistory' in interactable;
}
