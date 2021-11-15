require('phaser');

module.exports = class PreloadState extends Phaser.Scene {
    preload() {
        this.load.json('config', 'assets/data/config.json');
        this.load.json('baseGamePlays', 'assets/data/base.json');
        this.load.json('bonusGamePlays', 'assets/data/bonus.json');

        this.load.atlas('symbols', 'assets/images/symbols/symbols.png', 'assets/images/symbols/symbols.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.image('btn_spin', 'assets/images/ui/btn-spin.png');
        this.load.image('logo_main', 'assets/images/ui/logo-main.png');
        this.load.image('logo_bonus', 'assets/images/ui/logo-bonus.png');
        this.load.image('prize_window', 'assets/images/ui/total-win-label.png');

        this.load.html('force_play_form', 'assets/dom/force-play.html')
        this.load.html('bets_form', 'assets/dom/bets.html')
    }

    create() {
        this.game.scene.start('GameState');
    }
}