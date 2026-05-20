class SceneMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMenu' });
    }

    preload() {
        this.load.image('BGMenu', 'assets/BG1.png');
        this.load.image('Title', 'assets/Title.png');
        this.load.image('ButtonPlay', 'assets/ButtonPlay.png');
        this.load.image('ButtonSoundOn', 'assets/ButtonSoundOn.png');
        this.load.image('ButtonSoundOff', 'assets/ButtonSoundOff.png');
        this.load.audio('music_menu', ['assets/music_menu.mp3']);
        this.load.audio('snd_touch', ['assets/fx_touch.mp3', 'assets/fx_touch.ogg']);
    }

    create() {
        // Tampilan Scene Menu
        var bg = this.add.image(0, 0, 'BGMenu').setOrigin(0, 0);
        bg.setDisplaySize(480, 640);

        var title = this.add.image(240, 200, 'Title').setOrigin(0.5, 0.5);
        title.setDisplaySize(320, 120);

        var buttonPlay = this.add.image(240, 380, 'ButtonPlay').setOrigin(0.5, 0.5);
        buttonPlay.setDisplaySize(200, 70);

        // Sound Global
        snd_touch = this.sound.add('snd_touch');

        // Music menu
        if (!this.sound.get('music_menu')) {
            var music = this.sound.add('music_menu', { loop: true, volume: 0.5 });
            if (isSoundOn) music.play();
        }

        // Tombol Sound
        var buttonSound = this.add.image(430, 590, 'ButtonSoundOn').setOrigin(0.5, 0.5);
        buttonSound.setDisplaySize(60, 60);

        // Cek status sound dan ganti tampilan tombol
        if (!isSoundOn) {
            buttonSound.setTexture('ButtonSoundOff');
        } else {
            buttonSound.setTexture('ButtonSoundOn');
        }

        // Aktifkan interaksi
        buttonPlay.setInteractive();
        buttonSound.setInteractive();

        // Interaksi tombol Play
        this.input.on('gameobjectover', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonSound) {
                gameObject.setScale(1.1);
            }
        });

        this.input.on('gameobjectout', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonSound) {
                gameObject.setScale(1.0);
            }
        });

        this.input.on('gameobjectdown', function(pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonSound) {
                gameObject.setScale(0.95);
            }
        });

        this.input.on('gameobjectup', function(pointer, gameObject) {
            gameObject.setScale(1.0);

            if (gameObject === buttonPlay) {
                if (snd_touch && isSoundOn) snd_touch.play();
                this.scene.start('ScenePilihHero');
            }

            if (gameObject === buttonSound) {
                if (snd_touch && isSoundOn) snd_touch.play();

                isSoundOn = !isSoundOn;

                if (isSoundOn) {
                    buttonSound.setTexture('ButtonSoundOn');
                    // Mainkan kembali musik jika sound on
                    var existingMusic = this.sound.get('music_menu');
                    if (existingMusic) existingMusic.resume();
                } else {
                    buttonSound.setTexture('ButtonSoundOff');
                    // Matikan semua suara jika sound off
                    this.sound.pauseAll();
                }
            }
        }, this);
    }

    update() {}
}
