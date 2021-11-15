require('phaser');

import PreloadState from './states/PreloadState';
import GameState from './states/GameState';

class Game extends Phaser.Game {
    constructor(config) {
        super(config);

        this.scene.add('PreloadState', PreloadState, false);
        this.scene.add('GameState', GameState, false);

        this.scene.start('PreloadState');
    }
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#fff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    dom: {
        createContainer: true
    }
};

var game = new Game(config);