class Platformer extends Phaser.Scene {
    constructor() {
        super("platformer1Scene");

        //30, 2045
        this.spawnPosX = 30;
        this.spawnPosY = 2045;

        this.numCoins = 0;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 1800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.0;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.audio('step1_grass', 'footstep_grass_000.ogg');
        //this.load.audio('step2_grass', 'footstep_grass_001.ogg');
        //this.load.audio('step1_block', 'footstep_concrete_000');
        //this.load.audio('step2_block', 'footstep_concrete_001');

        //this.step1 = this.sound.add('step1_grass');
        //this.step1 = this.sound.add('assets/footstep_grass_000.ogg');
        //this.step1.on('play', listener);

    }


    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        this.physics.world.setBounds(0, 0, 199 * 18, 50 * 18);

        //this.spawnPosX = 30;
        //this.spawnPosY = 2045;
        this.jumpTimer = 0;

        this.coinCount = 0;

        this.numKeys = 0;
        this.gameActive = true;
        this.winCount = 0;
        this.frameCount = 0;

        this.soundCount = 0;
        //my.gameSounds = {};
        //my.gameSounds.sfx = {};
        //my.gameSounds.sfx.step1 = this.sound.add('step1_grass');
        this.walk1 = this.sound.add('step1_grass');

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        //this.background = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap-background");

        // Create a layer
        //this.backgroundLayer = this.map.createLayer("Background-tiles", this.background, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });

        this.locks = this.map.createFromObjects("Objects", {
            name: "lock",
            key: "tilemap_sheet",
            frame: 28
        });

        this.flags = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 68
        });

        this.doors = this.map.createFromObjects("Objects", {
            name: "door",
            key: "tilemap_sheet",
            frame: 130
        });

        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.locks, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.doors, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.keyGroup = this.add.group(this.keys);
        this.lockGroup = this.add.group(this.locks);
        this.flagGroup = this.add.group(this.flags);
        this.spikeGroup = this.add.group(this.spikes);
        this.doorGroup = this.add.group(this.doors);

        // set up player avatar (30, 2045)
        my.sprite.player = this.physics.add.sprite(this.spawnPosX, this.spawnPosY, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setScale(0.7);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.numCoins++;
            this.coinCount++;
        });

        // Handle collision detection with keys
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy();
            this.numKeys++;
            console.log(this.numKeys);
        });

        // Handle collision detection with locks
        this.physics.add.collider(my.sprite.player, this.lockGroup, (obj1, obj2) => {
            if (this.numKeys > 0) {
                this.numKeys--;
                obj2.destroy();
            }
        });

        // Handle collision with flags
        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            this.spawnPosX = obj2.x;
            this.spawnPosY = obj2.y;
            obj2.destroy();
            this.coinCount = 0;
        });

        // Handle collision with spikes
        this.physics.add.collider(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            //console.log("WDAHIAWDHOI");
            this.numCoins -= this.coinCount;
            this.coinCount = 0;
            this.scene.restart();
            //obj1.x = this.spawnPosX;
            //obj1.y = this.spawnPosY;
        });

        // Handle collision with door
        this.physics.add.overlap(my.sprite.player, this.doorGroup, (obj1, obj2) => {
            this.gameActive = false;
        });


        // set up Phaser-provided cursor key input, but also with wasd keys for preference
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.wKey = this.input.keyboard.addKey('W');
        this.aKey = this.input.keyboard.addKey('A');
        this.dKey = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: { start: 0.03, end: 0.1 },
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });

        // jumping vfx
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['trace_04.png', 'trace_05.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });

        my.vfx.walking.stop()
        this.arc1 = this.add.arc(30, 30, 20, 270, -270, true, 0xFFFF00, 1);
        this.arc1.setScrollFactor(0);
        this.coinText = this.add.text(60, 15, "x", {
            fontSize: '30px'
        });
        //this.coinText.text = "x " + this.numCoins;
        this.coinText.setColor("#ffffff");
        this.coinText.setScrollFactor(0);
        // camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);


        this.winText = this.add.text(game.config.width / 1.3, game.config.height / 2, "Congratulations", {
            fontSize: '30px'
        });
        this.winText.setColor("#ffffff");
        this.winText.setScrollFactor(0);
        this.winText.visible = false;

        this.button = this.add.rectangle(game.config.width / 1.15, game.config.height / 1.6, game.config.width / 8, game.config.height / 16, 0x6666ff);
        this.button.setInteractive();
        this.button.setScrollFactor(0);
        this.button.on('pointerup', function () {
            this.spawnPosX = 30;
            this.spawnPosY = 2045;
            this.numCoins = 0;
            this.scene.start("menuScene");
        }, this);
        this.button.visible = false;

        this.buttonText = this.add.text(game.config.width / 1.15, game.config.height / 1.6, "Main Menu", {
            fontSize: '25px'
        });
        this.buttonText.setColor("#ffffff");
        this.buttonText.setOrigin(0.5);
        this.buttonText.setScrollFactor(0);
        this.buttonText.visible = false;
    }


    update() {
        this.frameCount++;
        this.soundCount++;

        if (cursors.left.isDown || this.aKey.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // particle following code
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                //if(this.soundCount >= 120) {
                //    my.gameSounds.sfx.step1.play();
                //    this.soundCount = 0;
                //}
                if (!this.walk1.isPlaying) {
                    this.walk1.play();
                }
                if (this.frameCount > 10) {
                    my.vfx.walking.start();
                    this.frameCount = 0;
                }
                else {
                    my.vfx.walking.stop();
                    //my.gameSounds.sfx.step1.stop();
                }
            }

        } else if (cursors.right.isDown || this.dKey.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                //if(this.soundCount >= 120) {
                //    my.gameSounds.sfx.step1.play();
                //    this.soundCount = 0;
                //}
                if (!this.walk1.isPlaying) {
                    this.walk1.play();
                }
                if (this.frameCount > 10) {
                    my.vfx.walking.start();
                    this.frameCount = 0;
                }
                else {
                    //my.gameSounds.sfx.step1.stop();
                    my.vfx.walking.stop();
                }
            }


        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
            this.walk1.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(this.wKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
            this.jumpTimer = 0;
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.jumping.start();
        }

        this.jumpTimer++;
        if (this.jumpTimer > 15) my.vfx.jumping.stop();

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.numCoins -= this.coinCount;
            this.coinCount = 0;
            this.scene.restart();
        }
        this.updateText();

        if (!this.gameActive) {
            this.showWinText();
            this.winCount++;
            if (this.winCount >= 150) {
                this.showMenuButton();
            }
            //my.vfx.walking.stop();
            //my.sprite.player.anims.play('idle');
        }

        //if(this.soundCount >= 120) this.soundCount = 0;
    }

    updateText() {
        this.coinText.text = "x" + this.numCoins;
    }

    showWinText() {
        this.winText.visible = true;
        this.winText.text = "Congratulations\n" + "Score: " + this.numCoins;
    }

    showMenuButton() {
        this.button.visible = true;
        this.buttonText.visible = true;
    }

}