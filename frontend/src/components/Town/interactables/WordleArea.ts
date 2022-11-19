import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class WordleArea extends Interactable {
  private _infoTextBox?: Phaser.GameObjects.Text;

  getType(): KnownInteractableTypes {
    return 'wordleArea';
  }

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
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
    this._showInfoBox();
  }

  interact(): void {
    this._infoTextBox?.setVisible(false);
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
