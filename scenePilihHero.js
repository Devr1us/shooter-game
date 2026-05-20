class ScenePilihHero extends Phaser.Scene {
    constructor() {
        super({ key: 'ScenePilihHero' });
    }

    preload() {
        this.load.image('BGPilihPesawat', 'assets/BGPilihPesawat.png');
        this.load.image('Pesawat1', 'assets/Pesawat1.png');
        this.load.image('Pesawat2', 'assets/Pesawat2.png');
        this.load.image('ButtonNext', 'assets/ButtonNext.png');
        this.load.image('ButtonPrev', 'assets/ButtonPrev.png');
        this.load.image('ButtonMenu', 'assets/ButtonMenu.png');
    }

    create() {
        // Tampilan background
        var bg = this.add.image(0, 0, 'BGPilihPesawat').setOrigin(0, 0);
        bg.setDisplaySize(480, 640);

        // Teks judul
        this.add.text(240, 100, 'Pilih Pesawat', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);

        // Tampilkan pesawat berdasarkan currentHero
        var heroKeys = ['Pesawat1', 'Pesawat2'];
        var sprPesawat = this.add.image(240, 320, heroKeys[currentHero]).setOrigin(0.5, 0.5);
        sprPesawat.setDisplaySize(120, 150);

        // Teks nama pesawat
        var txtNama = this.add.text(240, 430, 'Pesawat ' + (currentHero + 1), {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Tombol-tombol
        var buttonPrev = this.add.image(80, 320, 'ButtonPrev').setOrigin(0.5, 0.5);
        buttonPrev.setDisplaySize(60, 60);

        var buttonNext = this.add.image(400, 320, 'ButtonNext').setOrigin(0.5, 0.5);
        buttonNext.setDisplaySize(60, 60);

        var buttonMenu = this.add.image(60, 40, 'ButtonMenu').setOrigin(0.5, 0.5);
        buttonMenu.setDisplaySize(50, 50);

        // Teks instruksi
        this.add.text(240, 530, 'Klik pesawat untuk mulai!', {
            fontSize: '18px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);

        // Aktifkan interaksi
        buttonPrev.setInteractive();
        buttonNext.setInteractive();
        buttonMenu.setInteractive();
        sprPesawat.setInteractive();

        // Deteksi interaksi Object Over
        this.input.on('gameobjectover', function(pointer, gameObject) {
            if ([buttonPrev, buttonNext, buttonMenu, sprPesawat].includes(gameObject)) {
                gameObject.setScale(1.1);
            }
        });

        // Deteksi interaksi Object Out
        this.input.on('gameobjectout', function(pointer, gameObject) {
            if ([buttonPrev, buttonNext, buttonMenu, sprPesawat].includes(gameObject)) {
                gameObject.setScale(1.0);
            }
        });

        // Deteksi interaksi Object Down
        this.input.on('gameobjectdown', function(pointer, gameObject) {
            if ([buttonPrev, buttonNext, buttonMenu, sprPesawat].includes(gameObject)) {
                gameObject.setScale(0.95);
            }
        });

        // Deteksi interaksi Object Up
        this.input.on('gameobjectup', function(pointer, gameObject) {
            gameObject.setScale(1.0);
            if (snd_touch && isSoundOn) snd_touch.play();

            if (gameObject === buttonNext) {
                currentHero = (currentHero + 1) % countHero;
                sprPesawat.setTexture(heroKeys[currentHero]);
                txtNama.setText('Pesawat ' + (currentHero + 1));
            }

            if (gameObject === buttonPrev) {
                currentHero = (currentHero - 1 + countHero) % countHero;
                sprPesawat.setTexture(heroKeys[currentHero]);
                txtNama.setText('Pesawat ' + (currentHero + 1));
            }

            if (gameObject === buttonMenu) {
                this.scene.start('SceneMenu');
            }

            if (gameObject === sprPesawat) {
                this.scene.start('ScenePlay');
            }
        }, this);
    }

    update() {}
}
