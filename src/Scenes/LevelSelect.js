class LevelSelect extends Phaser.Scene {
    constructor() {
        super("levelScene");

        //array to hold the X positions for the player to land on each level's circle
        this.levelXPositions = [];
        this.levelXPositions[0] = game.config.width / 6;   // 1/6
        this.levelXPositions[1] = game.config.width / 3;   // 2/6
        this.levelXPositions[2] = game.config.width / 2;   // 3/6
        this.levelXPositions[3] = 2 * game.config.width / 3; // 4/6
        this.levelXPositions[4] = 5 * game.config.width / 6; // 5/6
        this.levelCircleY = game.config.height / 2;   //height is halfway

        this.isMoving = false;
        this.isMovingRight = false;
        this.isMovingLeft = false;
        this.unlockedLevels;
        this.position = 0;
        this.data = [];
        this.cursorOffset = 75;
        this.cursorPos = 0;
        this.checkpointsUnlocked = 0;
        this.justMoved = false;
    }

    preload() {

    }

    create(data1) {
        this.data = data1;
        this.data[7] = 0;
        this.position = this.data[0];
        if (this.position == undefined) this.position = 0;
        this.checkpointsUnlocked = 0;
        this.justMoved = false;

        //determine how many paths are shown based on levels completed
        this.unlockedLevels = this.data[1];
        if (this.unlockedLevels > 0) {
            this.path = this.add.rectangle(3 * game.config.width / 12, game.config.height / 2, game.config.width / 6, 30, 0xFFFFFF);
            for (let i = 0; i < this.unlockedLevels - 1; i++) {
                if (i != 3) this.path.width += game.config.width / 6;
            }
        }

        //create the circles for each level
        for (let i = 0; i < 5; i++) {
            let color = 0xFF0000; // red
            if (i < this.unlockedLevels) {
                color = 0x00FF00; // green
            }
            this.levelCircle = this.add.arc(this.levelXPositions[i], this.levelCircleY, 50, 270, -270, true, color, 1);
        }

        //create player
        my.sprite.player = this.physics.add.sprite(this.levelXPositions[this.data[0]], this.levelCircleY, "platformer_characters", "tile_0000.png");
        my.sprite.player.setScale(3);
        my.sprite.player.setFlip(true, false);
        my.sprite.player.x = this.levelXPositions[this.position];

        //set up keys used for this level
        this.dKey = this.input.keyboard.addKey('D');
        this.aKey = this.input.keyboard.addKey('A');
        this.wKey = this.input.keyboard.addKey('W');
        this.sKey = this.input.keyboard.addKey('S');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.cursors = this.input.keyboard.createCursorKeys();

        //all the text explaining the game
        let infoStr = "This game supports both WASD and arrow key movements.\nSpacebar also supports jumping.\n\nUse movement to maneuver level and checkpoint selection.\nUse space key to enter the level at the chosen checkpoint.\nUse R to respawn at last gained checkpoint.\nUse escape to leave the level.";
        this.infoText = this.add.text(game.config.width / 2, game.config.height / 6, infoStr, {
            fontSize: '20px'
        });
        this.infoText.setColor("#ffffff");
        this.infoText.setOrigin(0.5);

        //holds the level selection box, along with the text used for checkpoints
        this.levelSelectionBox = this.add.rectangle(this.game.config.width / 2, 5 * game.config.height / 6, this.game.config.width / 2, 200, 0xFFFFFF);
        this.checkpoint0text = this.add.text(game.config.width / 2, 5 * game.config.height / 6 - 75, "Start of Level", {
            fontSize: '50px'
        });
        this.checkpoint0text.setColor("#000000");
        this.checkpoint0text.setOrigin(0.5);

        this.checkpoint1text = this.add.text(game.config.width / 2, 5 * game.config.height / 6, "Checkpoint 1", {
            fontSize: '50px'
        });
        this.checkpoint1text.setColor("#000000");
        this.checkpoint1text.setOrigin(0.5);
        this.checkpoint1text.visible = false;
        this.checkpoint2text = this.add.text(game.config.width / 2, 5 * game.config.height / 6 + 75, "Checkpoint 2", {
            fontSize: '50px'
        });
        this.checkpoint2text.setColor("#000000");
        this.checkpoint2text.setOrigin(0.5);
        this.checkpoint2text.visible = false;

        //the cursor used for selecting a checkpoint
        this.cursorPos = 0;
        this.levelPointerInitialY = (5 * game.config.height / 6) - 75;
        this.levelPointer = this.add.triangle(game.config.width / 3, this.levelPointerInitialY, 0, 32, 0, 0, 32, 16, 0x000000);

        //array holds the high scores for each level
        this.levelScores = [];
        for (let i = 0; i < 5; i++) {
            let yoffset = -100;
            if (i % 2 == 0) yoffset = 100;
            let levelHighScore = this.add.text(this.levelXPositions[i], this.levelCircleY + yoffset, "High Score: 0", {
                fontSize: '20px'
            });
            levelHighScore.setColor("#ffffff");
            levelHighScore.setOrigin(0.5);
            levelHighScore.visible = false;
            this.levelScores[i] = levelHighScore;
        }

        //create the button that unlocks every level in the game
        this.unlockButton = this.add.rectangle(game.config.width / 9, game.config.height / 12, game.config.width / 5, game.config.height / 10, 0x6666ff);
        this.unlockButton.setInteractive();
        this.unlockButton.on('pointerup', function () {
            //unlock all the levels
            this.data[1] = 5;
            //unlock all the checkpoints
            for (let i = 2; i <= 6; i++) {
                this.data[i] = 2;
            }
            //reload the scene with the new data
            this.scene.restart();
        }, this);
        this.unlockButtonText = this.add.text(game.config.width / 9, game.config.height / 12, "Unlock all levels", {
            fontSize: '25px'
        });
        this.unlockButtonText.setColor("#ffffff");
        this.unlockButtonText.setOrigin(0.5);

        //create the button which resets the game
        this.resetButton = this.add.rectangle(game.config.width / 9, game.config.height / 5, game.config.width / 5, game.config.height / 10, 0x6666ff);
        this.resetButton.setInteractive();
        this.resetButton.on('pointerup', function () {
            //load scene is used to initialize game, so this button essentially reboots the game just by loading the scene
            this.scene.start("loadScene");
        }, this);
        this.resetButtonText = this.add.text(game.config.width / 9, game.config.height / 5, "Reset all progress", {
            fontSize: '25px'
        });
        this.resetButtonText.setColor("#ffffff");
        this.resetButtonText.setOrigin(0.5);

        //creates the button which shows the credits
        this.creditsButton = this.add.rectangle(8 * game.config.width / 9, game.config.height / 12, game.config.width / 5, game.config.height / 10, 0x6666ff);
        this.creditsButton.setInteractive();
        this.creditsButton.on('pointerup', function () {
            this.scene.start("creditsScene", this.data);
        }, this);
        if (this.data[1] != 5) this.creditsButton.visible = false;
        this.creditsButtonText = this.add.text(8 * game.config.width / 9, game.config.height / 12, "Credits", {
            fontSize: '25px'
        });
        this.creditsButtonText.setColor("#ffffff");
        this.creditsButtonText.setOrigin(0.5);
        if (this.data[1] != 5) this.creditsButtonText.visible = false;

        this.physics.world.drawDebug = false;
    }

    update() {
        //code to check when player character is stationary on a level circle
        if (!this.isMovingRight && !this.isMovingLeft) {
            my.sprite.player.anims.play('idle');
            this.updateLevelText();
            if (this.justMoved) {
                this.levelPointer.y = this.levelPointerInitialY;
                this.cursorPos = 0;
                this.justMoved = false;
            }
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.loadLevel();
            }
        }

        //code to move player to the right
        if ((Phaser.Input.Keyboard.JustDown(this.dKey) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) && !this.isMoving && my.sprite.player.x < this.levelXPositions[4] && this.position < this.unlockedLevels) {
            this.isMovingRight = true;
            this.isMoving = true;
            my.sprite.player.x += 5;
            this.position++;
            this.justMoved = true;
        }

        //code to move player to the left
        if ((Phaser.Input.Keyboard.JustDown(this.aKey) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) && !this.isMoving && my.sprite.player.x > this.levelXPositions[0]) {
            this.isMovingLeft = true;
            this.isMoving = true;
            my.sprite.player.x -= 5;
            this.position--;
            this.justMoved = true;
        }

        //code for walking the player to the right
        if (this.isMovingRight) {
            this.moveRight();
            my.sprite.player.x += 2;
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
        }
        //code for walking the player to the left
        if (this.isMovingLeft) {
            this.moveLeft();
            my.sprite.player.x -= 2;
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
        }

        //code to move the checkpoint cursor up
        if ((Phaser.Input.Keyboard.JustDown(this.wKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) && this.cursorPos != 0) {
            this.cursorPos--;
            this.levelPointer.y -= this.cursorOffset;
            this.data[7]--;
        }

        //code to move the checkpoint cursor down
        if ((Phaser.Input.Keyboard.JustDown(this.sKey) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) && this.cursorPos != 2 && this.cursorPos < this.checkpointsUnlocked) {
            this.cursorPos++;
            this.levelPointer.y += this.cursorOffset;
            this.data[7]++;
        }

        this.updateScoreText();
    }

    //checks every valid position for the character to stop, updates variables and stops the movement when true
    moveLeft() {
        if (my.sprite.player.x == this.levelXPositions[0] || my.sprite.player.x == this.levelXPositions[0] - 1 || my.sprite.player.x == this.levelXPositions[0] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[1] || my.sprite.player.x == this.levelXPositions[1] - 1 || my.sprite.player.x == this.levelXPositions[1] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[2] || my.sprite.player.x == this.levelXPositions[2] - 1 || my.sprite.player.x == this.levelXPositions[2] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[3] || my.sprite.player.x == this.levelXPositions[3] - 1 || my.sprite.player.x == this.levelXPositions[3] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[4] || my.sprite.player.x == this.levelXPositions[4] - 1 || my.sprite.player.x == this.levelXPositions[4] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
    }

    //same deal as moveLeft but for moving the player to the right
    moveRight() {
        if (my.sprite.player.x == this.levelXPositions[0] || my.sprite.player.x == this.levelXPositions[0] - 1 || my.sprite.player.x == this.levelXPositions[0] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[1] || my.sprite.player.x == this.levelXPositions[1] - 1 || my.sprite.player.x == this.levelXPositions[1] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[2] || my.sprite.player.x == this.levelXPositions[2] - 1 || my.sprite.player.x == this.levelXPositions[2] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[3] || my.sprite.player.x == this.levelXPositions[3] - 1 || my.sprite.player.x == this.levelXPositions[3] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[4] || my.sprite.player.x == this.levelXPositions[4] - 1 || my.sprite.player.x == this.levelXPositions[4] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
    }

    //determines which level in the game to load into
    loadLevel() {
        if (this.position == 0) {
            this.scene.start("platformer0Scene", this.data);
        }
        if (this.position == 1) {
            this.scene.start("platformer1Scene", this.data);
        }
        if (this.position == 2) {
            this.scene.start("platformer2Scene", this.data);
        }
        if (this.position == 3) {
            this.scene.start("platformer3Scene", this.data);
        }
        if (this.position == 4) {
            this.scene.start("platformer4Scene", this.data);
        }
    }

    //determines the checkpoint texts to make visible based on what level the player is currently on
    updateLevelText() {
        if (this.data[this.position + 2] == 2) {
            this.checkpoint2text.visible = true;
            this.checkpoint1text.visible = true;
            this.checkpointsUnlocked = 2;
        }
        else if (this.data[this.position + 2] == 1) {
            this.checkpoint1text.visible = true;
            this.checkpoint2text.visible = false;
            this.checkpointsUnlocked = 1;
        }
        else {
            this.checkpoint2text.visible = false;
            this.checkpoint1text.visible = false;
            this.checkpointsUnlocked = 0;
        }
    }

    //display the high scores for each level
    updateScoreText() {
        for (let i = 0; i <= this.data[1] && i < 5; i++) {
            this.levelScores[i].visible = true;
            this.levelScores[i].text = "High Score: " + this.data[8 + i];
        }
    }
}