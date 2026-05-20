class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    preload() {
        this.load.image('BGGameOver', 'assets/BG1.png');
        this.load.image('ButtonMenu', 'assets/ButtonMenu.png');
        this.load.image('ButtonPlay', 'assets/ButtonPlay.png');
        this.load.audio('music_gameover', ['assets/music_gameover.mp3', 'assets/music_gameover.ogg']);
        this.load.audio('snd_touch', ['assets/fx_touch.mp3', 'assets/fx_touch.ogg']);
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        // Background
        var bg = this.add.image(0, 0, 'BGGameOver').setOrigin(0, 0);
        bg.setDisplaySize(480, 640);

        // Overlay gelap
        var overlay = this.add.rectangle(240, 320, 480, 640, 0x000000, 0.6);

        // Teks GAME OVER
        this.add.text(240, 130, 'GAME OVER', {
            fontSize: '52px',
            fill: '#ff2222',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5, 0.5);

        // Panel skor
        var panel = this.add.rectangle(240, 310, 360, 220, 0x000000, 0.7);
        panel.setStrokeStyle(2, 0xffffff);

        // Score
        this.add.text(240, 230, 'Score', {
            fontSize: '22px',
            fill: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);

        this.add.text(240, 270, '' + this.finalScore, {
            fontSize: '52px',
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);

        // High Score
        var highScore = localStorage.getItem('highScore_shooter') || 0;
        highScore = parseInt(highScore);

        if (this.finalScore > highScore) {
            highScore = this.finalScore;
            localStorage.setItem('highScore_shooter', highScore);
            // Teks new record
            this.add.text(240, 325, '🏆 NEW RECORD!', {
                fontSize: '20px',
                fill: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5, 0.5);
        }

        this.add.text(240, 360, 'High Score', {
            fontSize: '18px',
            fill: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);

        this.add.text(240, 395, '' + highScore, {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Tombol Play Lagi
        var buttonPlay = this.add.image(240, 500, 'ButtonPlay').setOrigin(0.5, 0.5);
        buttonPlay.setDisplaySize(200, 65);

        this.add.text(240, 500, 'Main Lagi', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5).setDepth(1);

        // Tombol Menu
        var buttonMenu = this.add.image(240, 580, 'ButtonMenu').setOrigin(0.5, 0.5);
        buttonMenu.setDisplaySize(50, 50);

        // Music game over
        if (isSoundOn) {
            this.sound.add('music_gameover', { loop: false, volume: 0.5 }).play();
        }

        // Aktifkan interaksi
        buttonPlay.setInteractive();
        buttonMenu.setInteractive();

        this.input.on('gameobjectover', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonMenu) {
                gameObject.setScale(1.1);
            }
        });

        this.input.on('gameobjectout', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonMenu) {
                gameObject.setScale(1.0);
            }
        });

        this.input.on('gameobjectdown', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonMenu) {
                gameObject.setScale(0.95);
            }
        });

        this.input.on('gameobjectup', function(pointer, gameObject) {
            gameObject.setScale(1.0);
            if (snd_touch && isSoundOn) snd_touch.play();

            if (gameObject === buttonPlay) {
                this.sound.stopAll();
                this.scene.start('ScenePlay');
            }

            if (gameObject === buttonMenu) {
                this.sound.stopAll();
                this.scene.start('SceneMenu');
            }
        }, this);
    }

    update() {}
}
