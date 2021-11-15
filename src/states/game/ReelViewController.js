require('phaser');
const SymbolView = require('./SymbolView');

module.exports = class ReelViewController extends Phaser.Events.EventEmitter {

    constructor(scene, model, container, index, initialHeight, stripe) {
        super();

        this.scene = scene;
        this.model = model;
        this.mainContainer = container;
        this.index = index;
        this.initialHeight = initialHeight;
        this.stripe = stripe;

        this.createView();
    }

    createView() {
        this.container = this.scene.add.container(150 * this.index, 0);
        this.mainContainer.add(this.container);

        this.createInitialSymbols();
    }

    getView() {
        return this.container;
    }

    createInitialSymbols() {
        this.symbols = [];
        for (let i = 0; i < this.initialHeight; i++) {
            let id = this.stripe[this.stripe.length - 1 - i];
            let sym = new SymbolView(this.scene, this.container, this.model, i, id);

            this.symbols.push(sym);
        }
    }

    startSpin() {

    }

    stopSpin(response, delay) {
        this.addNewSymbols(response);
        this.animateSpin(delay, response.length);
    }

    resetReel(fixedHeight) {
        this.container.y = 0;

        let dif = this.symbols.length - fixedHeight;
        for (let i = 0; i < dif; i++) {
            this.symbols.pop().destroy();
        }
    }

    addNewSymbols(symbols) {
        for (let i = symbols.length - 1; i >= 0; i--) {
            let id = symbols[i];
            let index = i - symbols.length;
            let sym = new SymbolView(this.scene, this.container, this.model, index, id);
            this.symbols.unshift(sym);
        }

        for (let i = 0; i < this.symbols.length; i++) {
            let sym = this.symbols[i];
            sym.index = i;
            // sym.forcePosY();
        }
    }

    clearExtraSymbols(fixedHeight) {
        for (let i = 0; i < fixedHeight; i++) {
            this.symbols.pop().destroy();
        }

        // for (let i = this.symbols.length - 1; i >= 0; i--) {
        //     let symbol = this.symbols[i];
        //     symbol.index = i;
        // }
    }

    getNextFallingSymbol(startingIndex) {
        for (let i = startingIndex; i >= 0; i--) {
            let symbol = this.symbols[i];
            if (symbol != null) {
                this.symbols[i] = null;
                return symbol;
            }
        }

        return null;
    }

    animateSpin(delay, steps) {
        for (let i = 0; i < this.symbols.length; i++) {
            let symbol = this.symbols[i];
            symbol.once('animComplete', () => { this.emit("animComplete", this.index); });
            symbol.animateSymbol(delay, steps);
        }
    }

    animateDestroySymbol(index) {
        let symbol = this.symbols[index];
        if (symbol == null) {
            return;
        }

        symbol.once('animDestroyComplete', () => { this.emit("animDestroyComplete", this.index); });
        symbol.animateDestroy();

        this.symbols[index] = null;
    }

    animateFallSymbols() {
        for (let i = this.symbols.length - 1; i >= 0; i--) {
            let symbol = this.symbols[i];
            if (symbol == null) {
                symbol = this.getNextFallingSymbol(i - 1);
                if (symbol != null) {
                    this.symbols[i] = symbol;
                    symbol.once('animFallComplete', () => { this.emit("animFallComplete", this.index); })
                    symbol.animateFalling(i);
                }
            }
        }
    }

    addCascadeSymbols(stripe) {
        let dif = stripe.length - this.symbols.length;
        for (let i = 0; i < dif; i++) {
            this.symbols.unshift(null);
        }

        for (let i = this.symbols.length - 1; i >= 0; i--) {
            let symbol = this.symbols[i];
            if (symbol == null) {
                symbol = new SymbolView(this.scene, this.container, this.model, i, stripe[i], true);
                symbol.once('animEnterComplete', () => { this.emit("animEnterComplete", this.index); })
                this.symbols[i] = symbol;
            } else {
                symbol.index = i;
                symbol.forcePosY();
            }
        }

        dif = stripe.length - this.initialHeight;
        this.container.y = -(dif * 150);
    }
}
