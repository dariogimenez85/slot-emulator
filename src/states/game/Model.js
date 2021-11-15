module.exports = class Model extends Phaser.Events.EventEmitter {

    constructor(scene) {
        super();

        this.scene = scene;
        this.init();
    }

    init() {
        this.config = this.scene.game.cache.json.get('config');
        this.baseGamePlays = this.scene.game.cache.json.get('baseGamePlays');
        this.bonusGamePlays = this.scene.game.cache.json.get('bonusGamePlays');

        this.lastResult = null;
    }

    //game properties
    getDebugMode() {
        return this.config.debug;
    }

    getReels() {
        return this.config.reels;
    }

    getReelById(id) {
        return this.config.reels["r" + id];
    }

    getGridX() {
        return this.config.gridX;
    }

    getGridY() {
        return this.config.gridY;
    }

    getGridWidth() {
        return this.config.gridWidth;
    }

    getGridHeight() {
        return this.config.gridHeight;
    }

    getSymbolSize() {
        return this.config.symbolSize;
    }

    getSlotType() {
        return this.config.slotType;
    }

    getLastResult() {
        return this.lastResult;
    }

    getRandomBaseSpin() {
        let rnd = Math.round(Math.random() * (this.baseGamePlays.spins.length - 1));
        let source = this.baseGamePlays.spins[rnd];
        let result = JSON.parse(JSON.stringify(source));

        return result;
    }

    getRandomBonusSpin() {
        let rnd = Math.round(Math.random() * (this.bonusGamePlays.spins.length - 1));
        let source = this.bonusGamePlays.spins[rnd];
        let result = JSON.parse(JSON.stringify(source));

        return result;
    }

    //game actions
    spin(forcedPlay) {
        // if (this.lastResult != null && this.lastResult.length > 0) {
        //     this.spinNextStep();
        //     this.emit('spinFinished');
        //     return;
        // }

        switch (parseInt(forcedPlay)) {
            //base no prize
            case 1:
                this.lastResult = this.getRandomBaseSpin();
                while (this.lastResult[0].basespin.wonCredits > 0) {
                    this.lastResult = this.getRandomBaseSpin();
                }

                break;
            //base with prize
            case 2:
                this.lastResult = this.getRandomBaseSpin();
                while (this.lastResult[0].basespin.wonCredits == 0) {
                    this.lastResult = this.getRandomBaseSpin();
                }

                break;
            //bonus
            case 3:
                this.lastResult = this.getRandomBonusSpin();

                break;
            //random
            default:
                this.lastResult = (Math.round(Math.random()) % 2 == 0) ? this.getRandomBaseSpin() : this.getRandomBonusSpin();
                break;
        }

        this.spinNextStep();
    }

    spinNextStep() {
        if (this.lastResult == null || this.lastResult.length == 0) {
            this.emit('spinFinished');
            return;
        }

        let result = this.lastResult.shift();
        if (result.freespin != null) {
            result = { type: 'freespin', data: result.freespin };
        } else if (result.cascade != null) {
            result = { type: 'cascade', data: result.cascade };
        } else {
            result = { type: 'basespin', data: result.basespin };
        }
        console.log(result);

        this.emit('spinResult', result);
    }
}
