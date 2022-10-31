import WordleAreaController from '../../../classes/WordleAreaController';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class WordleArea extends Interactable {
  private _infoTextBox?: Phaser.GameObjects.Text;

  private _wordleArea?: WordleAreaController;

  getType(): KnownInteractableTypes {
    return 'wordleArea';
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found a Wordle game area!\nStart the game by pressing the spacebar.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    if (this._wordleArea === undefined) {
      this._showInfoBox();
    }
  }

  interact(): void {
    if (this._wordleArea !== undefined) {
      this._wordleArea.isPlaying = true;
      this._infoTextBox?.setVisible(false);
    }
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
