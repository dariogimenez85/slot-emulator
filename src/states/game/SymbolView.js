require('phaser');

module.exports = class SymbolView extends Phaser.Events.EventEmitter {

    constructor(scene, container, model, index, id, enterAnim = false) {
        super();

        this.scene = scene;
        this.mainContainer = container;
        this.model = model;
        this.index = index;
        this.id = id;

        this.createView(enterAnim);
    }

    createView(enterAnim = false) {
        this.container = this.scene.add.container(0, 150 * this.index);
        this.mainContainer.add(this.container);

        this.view = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'symbols', 'sym_' + this.id);
        this.view.setOrigin(0, 0);
        this.container.add(this.view);

        if(this.model.getDebugMode()){
            this.debug = this.scene.add.text(0, 0, this.id, { font: "bold 10pt Arial", fill: "#000" });
            this.container.add(this.debug);
        }

        if (enterAnim) {
            let finalY = this.container.y;
            this.container.y -= 150;
            this.container.alpha = 0;
            let delay = 250 + (Math.random() * 250);
            this.tween = this.scene.tweens.add({ targets: this.container, y: finalY, alpha: 1, ease: 'Back.Out', duration: 1000, delay: delay, onComplete: () => { this.emit('animEnterComplete') } });
        }
    }

    forcePosY() {
        this.container.y = 150 * this.index;
    }

    animateSymbol(delay, steps) {
        this.tween = this.scene.tweens.add({ targets: this.container, y: this.container.y + 150 * steps, ease: 'Back.InOut', duration: 2000, delay: delay, onComplete: () => { this.emit('animComplete') } });
    }

    animateDestroy() {
        let delay = (Math.random() * 250);
        this.tween = this.scene.tweens.add({ targets: this.container, alpha: 0, ease: 'Back.In', duration: 1000, delay: delay, onComplete: () => { this.emit('animDestroyComplete') } });
    }

    animateFalling(index) {
        this.index = index;
        this.tween = this.scene.tweens.add({ targets: this.container, y: 150 * this.index, ease: 'Lineal', duration: 300, onComplete: () => { this.emit('animFallComplete') } });
    }

    destroy() {
        this.tween.remove();
        this.container.remove(this.view);
        this.mainContainer.remove(this.container);
        this.view.destroy();
        this.container.destroy();
    }
}