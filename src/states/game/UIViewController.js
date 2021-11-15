require('phaser');

module.exports = class UIViewController extends Phaser.Events.EventEmitter {

    constructor(scene) {
        super();

        this.scene = scene;

        this.createView();
    }

    createView() {
        //button spin
        this.btnSpin = this.scene.add.sprite(1120, 570, 'btn_spin');
        this.btnSpin.setInteractive();
        this.btnSpin.on('pointerdown', () => { this.btnDown(); });
        this.btnSpin.on('pointerup', () => { this.btnUp(); });
        this.btnSpin.on('pointerout', () => { this.btnOut(); });

        //total win
        this.totalWinBox = this.scene.add.sprite(1120, 200, "prize_window");
        this.totalWin = this.scene.add.text(1100, 180, "0", { font: "bold 50pt Arial", fill: "#000" });
        this.centerText();

        //FS Left
        this.FSLeftTitle = this.scene.add.text(1150, 372, "FS Left", { font: "bold 23px Arial", fill: "#000" });
        this.FSLeft = this.scene.add.text(1185, 400, "0", { font: "bold 23px Arial", fill: "#000" });

        //status
        this.setSpinStatus(false);

        //title
        this.setGameTitle(true);

        //dom forced plays
        this.form = this.scene.add.dom(1120, 320).createFromCache('force_play_form');
        this.form.addListener('change');
        this.form.on('change', (event) => {
            this.setGameType(event.target.value);
        });

        //dom bets
        this.form = this.scene.add.dom(1043, 400).createFromCache('bets_form');
        this.form.addListener('change');
        this.form.on('change', (event) => {
            this.setTotalBet(event.target.value);
        });

        this.setGameType(0);
        this.setTotalBet(1);
        this.setBonusGame(false);
    }

    setGameType(type) {
        this.gameType = type;
    }

    setTotalBet(bet) {
        this.totalBet = bet;
    }

    btnDown() {
        if (this.spinLocked) { return; }

        this.btnSpin.scale = 0.9;
    }

    btnUp() {
        if (this.spinLocked) { return; }

        this.btnOut();
        this.emit('spin', this.gameType);
    }

    btnOut() {
        if (this.spinLocked) { return; }

        this.btnSpin.scale = 1;
    }

    setGameTitle(isBaseGame) {
        if (this.title != null) {
            this.title.destroy();
        }

        let texture = isBaseGame ? 'logo_main' : 'logo_bonus';
        this.title = this.scene.add.sprite(480, 50, texture);
        this.title.setOrigin(0.5);
    }

    setBonusGame(isBonusGame){
        this.FSLeftTitle.visible = this.FSLeft.visible = isBonusGame;
    }

    updateFSLeft(left){
        this.FSLeft.text = left;
    }

    updateTotalWin(value, add = false) {
        value = value * this.totalBet;

        if (add) {
            value += Number(this.totalWin.text);
        }

        this.totalWin.text = value;
        this.centerText();
    }

    centerText() {
        this.totalWin.x = this.totalWinBox.x - this.totalWin.width / 2;
    }

    setSpinStatus(locked) {
        this.spinLocked = locked;
    }

}
