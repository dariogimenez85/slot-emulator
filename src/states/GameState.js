const UIViewController = require('./game/UIViewController');
const Model = require('./game/Model');
const ReelsController = require('./game/ReelsController');

require('phaser');

module.exports = class GameState extends Phaser.Scene {
    preload() {

    }

    create() {
        this.model = new Model(this);
        this.model.on('spinResult', (result) => { this.spinResponse(result); });
        this.model.on('spinFinished', () => { this.spinFinished(); });

        this.ui = new UIViewController(this);
        this.ui.on('spin', (type) => { this.startSpin(type); });

        this.reels = new ReelsController(this, this.model);
    }

    startSpin(type) {
        this.reels.startSpin();
        
        this.model.spin(type);

        this.ui.setSpinStatus(true);
        this.ui.updateTotalWin(0);
    }

    spinResponse(result) {
        this.lastResult = result;
        this.reels.stopSpin(result);
        this.reels.once('spinComplete', () => { this.spinAnimComplete(); });

        if (this.lastResult.type != 'cascade') {
            this.ui.setGameTitle(this.lastResult.type == 'basespin');
            this.ui.setBonusGame(this.lastResult.type == 'freespin');
        }

        this.ui.updateFSLeft(this.lastResult.data.remainingFreeGames);
    }

    spinAnimComplete() {
        this.ui.updateTotalWin(this.lastResult.data.wonCredits, true);

        let delay = this.lastResult.data.wonCredits > 0 ? 1500 : 500;
        this.time.delayedCall(delay, this.model.spinNextStep, null, this.model);
        // this.spinFinished();
    }

    spinFinished() {
        this.ui.setSpinStatus(false);
    }

    update() {

    }
}