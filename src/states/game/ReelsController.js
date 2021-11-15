const ReelViewController = require('./ReelViewController');

require('phaser');

module.exports = class ReelsController extends Phaser.Events.EventEmitter {

    constructor(scene, model) {
        super();

        this.scene = scene;
        this.model = model;

        this.init();
    }

    init() {
        //reel container
        this.reelContainer = this.scene.add.container(this.model.getGridX(), this.model.getGridY());

        // reels
        this.reels = [];
        for (let i = 0; i < this.model.getGridWidth(); i++) {
            let reelView = new ReelViewController(this.scene, this.model, this.reelContainer, i, this.model.getGridHeight(), this.model.getReelById(i));
            reelView.on('animComplete', (reelId) => { this.animComplete(reelId) });
            reelView.on('animDestroyComplete', (reelId) => { });
            reelView.on('animFallComplete', (reelId) => { });
            reelView.on('animEnterComplete', (reelId) => { this.animEnterComplete(reelId); });
            this.reelContainer.add(reelView.getView());

            this.reels.push(reelView);
        }

        //reel container
        this.linesContainer = this.scene.add.container(this.model.getGridX(), this.model.getGridY());

        //mask
        let fillAlpha = this.model.getDebugMode() ? .1 : 0;
        let rect = this.scene.add.graphics();
        rect.x = this.model.getGridX();
        rect.y = this.model.getGridY();
        rect.fillStyle(0xFF0000, fillAlpha);
        rect.fillRect(0, 0, 150 * this.model.getGridWidth(), 150 * this.model.getGridHeight());

        let mask = rect.createGeometryMask();
        this.reelContainer.setMask(mask);
    }

    // startSpin() {

    // }

    // stopSpin(result) {
    // }


    startSpin() {
        // return;

        this.clearLines();
        this.cascadeCount = 0;
        this.resizeGrid(this.cascadeCount);

        for (let i = 0; i < this.reels.length; i++) {
            let reel = this.reels[i];
            reel.resetReel(this.model.getGridHeight());
        }
    }

    stopSpin(result) {
        this.lastResult = result;
        this.clearLines();
        this.reelsReady = [];

        this.cascadeCount = this.lastResult.data.reelsSlices[0].length - this.model.getGridHeight();
        this.resizeGrid(this.cascadeCount);

        if (this.lastResult.type == 'cascade') {
            this.stopCascadeSpin()
            return;
        }

        for (let i = 0; i < this.reels.length; i++) {
            this.reelsReady.push(false);

            let reel = this.reels[i];
            // reel.resetReel(this.lastResult.data.reelsSlices[i].length);

            let delay = 50 * i;
            reel.stopSpin(this.lastResult.data.reelsSlices[i], delay);
        }
    }

    stopCascadeSpin() {
        this.reelsReady = [];

        //destroy anim
        for (let i = 0; i < this.deleteCascadeSymbols.length; i++) {
            let symPos = this.deleteCascadeSymbols[i];

            if (this.reelsReady[symPos.posX] == null) {
                this.reelsReady.push(false);
            }

            let reel = this.reels[symPos.posX];
            reel.animateDestroySymbol(symPos.posY);
        }

        //fall symbols
        this.scene.time.delayedCall(1000, () => {
            for (let i = 0; i < this.reels.length; i++) {
                let reel = this.reels[i];
                reel.animateFallSymbols();
            }
        }, null, this);

        //add new symbols
        this.scene.time.delayedCall(1500, () => {

            for (let i = 0; i < this.reels.length; i++) {
                let reel = this.reels[i];
                reel.addCascadeSymbols(this.lastResult.data.reelsSlices[i]);
            }
        }, null, this);
    }

    animComplete(reelId) {
        if (this.reelsReady[reelId] === true) {
            return;
        }

        this.reelsReady[reelId] = true;

        let pending = this.reelsReady.indexOf(false) > -1;
        if (pending) { return; }

        for (let i = 0; i < this.reels.length; i++) {
            let reel = this.reels[i];
            reel.clearExtraSymbols(this.lastResult.data.reelsSlices[i].length);
        }

        this.showLines();
        this.emit('spinComplete');
    }

    animEnterComplete(reelId) {
        if (this.reelsReady[reelId] === true) {
            return;
        }

        this.reelsReady[reelId] = true;

        let pending = this.reelsReady.indexOf(false) > -1;
        if (pending) { return; }

        this.showLines();
        this.emit('spinComplete');
    }

    resizeGrid(level) {
        let m = this.model;

        let downsizeLevel = 1 - (level / (m.getGridHeight() + level));
        let initW = m.getGridWidth() * m.getSymbolSize();
        let initH = m.getGridHeight() * m.getSymbolSize();
        let newX = m.getGridX() + (initW / 2) - (initW * downsizeLevel) / 2;
        let newY = initH + m.getGridY() - (initH * downsizeLevel);

        this.tween = this.scene.tweens.add({
            targets: this.reelContainer, x: newX, y: newY, scale: downsizeLevel, ease: 'Linear', duration: 500, delay: 0, onComplete: () => {

                //set lines container position to match with symbols in reels
                this.linesContainer.scale = this.reelContainer.scale;
                this.linesContainer.x = this.reelContainer.x;
                this.linesContainer.y = this.reelContainer.y - (m.getSymbolSize() * this.linesContainer.scale * level);

            }
        });
    }

    showLines() {
        this.deleteCascadeSymbols = [];

        let prizes = this.lastResult.data.wonPrizes;

        if (prizes.length == 0) { return; }

        for (let i = 0; i < prizes.length; i++) {
            let symbols = prizes[i].symbols;
            for (let j = 0; j < symbols.length; j++) {
                let sym = symbols[j];
                let xx = sym.reel * 150;
                let yy = sym.position * 150;

                let mark = this.scene.add.sprite(xx, yy, 'symbols', 'border');
                mark.setOrigin(0, 0);
                this.linesContainer.add(mark);

                this.deleteCascadeSymbols.push({ posX: sym.reel, posY: sym.position });
            }
        }
    }

    clearLines() {
        while (this.linesContainer.list.length > 0) {
            this.linesContainer.first.destroy();
        }
    }
}
