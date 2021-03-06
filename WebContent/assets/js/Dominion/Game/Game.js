Dominion.Game = (function(Game) {
    Game = function(initData) {
        this.Api = new Dominion.Api('//localhost:8080/Dominion/api?', true);
        this.players = initData.players;
        this.cardSet = initData.cardSet;
        this.gameData = null;
        this.Interface = null;
        this.playingAction = false;
        this.returnToSamePlayer = true;
        this.cardsSelected = 0;
        this.hasSkippedThisTurn = false;
        this.initGame();
        gameObj = this;
    };

    Game.prototype.startGame = function (players, cardset) {
        var that = this;
        var playerString = this.constructPlayerString(players);
        this.Api.doCall({'action': 'setup', 'cardset': cardset, 'players': playerString},
            function() {
                console.log("The game has been started.");
                that.Interface = new Dominion.Interface();
                that.updateGameInfo(function() {
                    that.Interface.passTurn(that.gameData.game.turn.player, function() {
                        $('#config').remove();
                        $('#game').show();
                        $('.overlay').slideUp(function() {
                            $('.overlay').remove();
                        });
                    });
                });
            }
        );
    };

    Game.prototype.constructPlayerString = function(players) {
        var playerString = "";

        for(var player in players) {
            playerString += players[player];
            playerString += "¤";
        }

        return playerString.substring(0, playerString.length - 1);
    };

    Game.prototype.buyCard = function(card) {
        var that = this;
        this.Api.doCall({'action': 'buycard', 'card': card.toLowerCase().replace(/ /g, "_")},
            function() {
                console.log("Card has been purchased.");
                that.updateGameInfo();
            }
        );
    };

    Game.prototype.playCard = function(card) {
        var cardToPlay = card.children().first().children().text().toLowerCase().replace(/ /g, "_");
        var that = this;

        this.Api.doCall({'action': 'playcard', 'card': cardToPlay},
            function(data) {
                console.log("CARD PLAY RESPONSE: ", data);
                if (data.response == "OK") {
                    that.Interface.addCardToField(card);
                    if(data.result !== "DONE") {
                        that.playingAction = true;
                        that.updateGameInfo();
                        that.Interface.showCardSelector(data, cardToPlay);
                    } else {
                        that.updateGameInfo();
                    }
                }
            }
        );
    };

    Game.prototype.updateGameInfo = function (callback) {
        var that = this;
        this.Api.doCall({'action': 'info'},
            function (data) {
                that.gameData = data;
                that.Interface.setGameData(that.gameData);
                that.Interface.refreshUI();
                that.handlePhaseSkip();

                if(callback) {
                    callback();
                }
            }
        );
    };

    Game.prototype.handContainsActions = function () {
        var currentPlayerHand = this.fetchCurrentPlayerHand();
        var containsActions = false;

        for(var card in currentPlayerHand) {
            if(currentPlayerHand[card].type.substring(0, 6) === "ACTION") {
                containsActions = true;
            }
        }

        return containsActions;
    };

    Game.prototype.fetchCurrentPlayerHand = function () {
        var currentPlayerName = this.gameData.game.turn.player;
        var playersInGame = this.gameData.game.players;
        var currentPlayerHand = [];

        for (var player in playersInGame) {
            if(playersInGame[player].displayname === currentPlayerName) {
                currentPlayerHand = playersInGame[player].hand;
            }
        }

        return currentPlayerHand;
    };

    Game.prototype.endPhase = function () {
        var that = this;
        this.Api.doCall({'action': 'endphase'},
            function (data) {
                console.log("Phase Ended!");
                that.updateGameInfo();
                if (data.result === "GAMEOVER") {
                    $('.overlay').remove();
                    that.Interface.showGameOver(data);
                }
            }
        );
    };

    Game.prototype.selectCard = function(card, element) {
        var that = this;
        this.Api.doCall({'action': 'selectcard', 'card': card.replace(/ /g, "_")},
            function (data) {
                console.log('Card Selected: ', card);
                console.log('Card Select Response', data);
                if(data.response === "OK") {
                    that.handleSelect(data, that);
                    element.remove();
                }
            }
        );
    };

    Game.prototype.handlePhaseSkip = function() {
        if (this.gameData.game.turn.phase === "ACTION") {
            if(this.handContainsActions() === false && this.playingAction === false) {
                if(this.hasSkippedThisTurn === false) {
                    this.Interface.handlePhaseEnd();
                    this.hasSkippedThisTurn = true;
                }
            } else if(this.gameData.game.turn.actionsleft === 0) {
                if(this.hasSkippedThisTurn === false) {
                    this.Interface.handlePhaseEnd();
                    this.hasSkippedThisTurn = true;
                }
            }
        }
    };

    Game.prototype.stopAction = function() {
        this.Api.doCall({'action': 'stopaction'},
            function() {
                this.playingAction = false;
            }
        );
    };

    Game.prototype.handleSelect = function(data, that) {
        that.cardsSelected++;

        if (data.result === "DONE") {
            if (this.returnToSamePlayer === true) {
                this.stopAction();
                $('.overlay').slideUp(function() {
                    $('.overlay').remove();
                });
                this.returnToSamePlayer = false;
            } else {
                that.Interface.passTurn(that.gameData.game.turn.player, function() {
                    $('.overlay').slideUp(function() {
                        $('.overlay').remove();
                    });
                });
            }

            that.updateGameInfo();
        }

        if (that.cardsSelected === data.max && that.cardsSelected >= data.min) {
            that.cardsSelected = 0;
            that.Interface.showCardSelector(data);
        }
    };

    Game.prototype.initGame = function() {
        var that = this;
        this.Api.doCall({'action': 'create'},
            function() {
                console.log('The game has been created.');
                that.startGame(that.players, that.cardSet);
            }
        );
    };

    return Game;
}(Dominion.Game || {}));
