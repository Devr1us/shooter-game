// =====================
// CLASS BULLET (Peluru)
// =====================
class Bullet {
    constructor() {
        this.spr = null;
        this.isActive = false;
    }

    Bullet(scene, x, y) {
        this.spr = scene.add.image(x, y, 'Peluru');
        this.spr.setDisplaySize(20, 40);
        this.isActive = true;
    }

    move() {
        if (this.isActive && this.spr) {
            this.spr.y -= 10;
            // Hapus jika keluar layar
            if (this.spr.y < -50) {
                this.spr.destroy();
                this.spr = null;
                this.isActive = false;
            }
        }
    }
}

// =====================
// CLASS ENEMY (Musuh)
// =====================
class Enemy {
    constructor() {
        this.spr = null;
        this.isActive = false;
        this.pathIndex = 0;
        this.path = null;
        this.speed = 0;
        this.t = 0;
    }

    Enemy(scene, path) {
        var musuhKeys = ['Musuh1', 'Musuh2', 'Musuh3'];
        var randKey = musuhKeys[Phaser.Math.Between(0, musuhKeys.length - 1)];
        this.spr = scene.add.image(0, 0, randKey);
        this.spr.setDisplaySize(60, 70);
        this.isActive = true;
        this.path = path;
        this.t = 0;
        this.speed = Phaser.Math.FloatBetween(0.003, 0.006);

        // Posisi awal di titik pertama path
        if (this.path && this.path.length > 0) {
            this.spr.x = this.path[0].x;
            this.spr.y = this.path[0].y;
        }
    }

    move() {
        if (!this.isActive || !this.spr) return;

        this.t += this.speed;
        if (this.t > 1) this.t = 1;

        if (this.path && this.path.length >= 2) {
            // Interpolasi posisi sepanjang path
            var totalSegments = this.path.length - 1;
            var scaledT = this.t * totalSegments;
            var segIndex = Math.floor(scaledT);
            var localT = scaledT - segIndex;

            if (segIndex >= totalSegments) {
                segIndex = totalSegments - 1;
                localT = 1;
            }

            var p0 = this.path[segIndex];
            var p1 = this.path[segIndex + 1];

            this.spr.x = Phaser.Math.Linear(p0.x, p1.x, localT);
            this.spr.y = Phaser.Math.Linear(p0.y, p1.y, localT);
        }

        // Nonaktifkan jika sudah mencapai akhir path
        if (this.t >= 1) {
            this.spr.destroy();
            this.spr = null;
            this.isActive = false;
        }

        // Nonaktifkan jika keluar layar bawah
        if (this.spr && this.spr.y > 700) {
            this.spr.destroy();
            this.spr = null;
            this.isActive = false;
        }
    }
}

// =====================
// SCENE PLAY
// =====================
class ScenePlay extends Phaser.Scene {
    constructor() {
        super({ key: 'ScenePlay' });
    }

    preload() {
        this.load.image('BGPlay', 'assets/images/BGPlay.png');
        this.load.image('BG2', 'assets/images/BG2.png');
        this.load.image('BG3', 'assets/images/BG3.png');
        this.load.image('cloud', 'assets/images/cloud.png');
        this.load.image('Pesawat1', 'assets/images/Pesawat1.png');
        this.load.image('Pesawat2', 'assets/images/Pesawat2.png');
        this.load.image('Peluru', 'assets/images/Peluru.png');
        this.load.image('Musuh1', 'assets/images/Musuh1.png');
        this.load.image('Musuh2', 'assets/images/Musuh2.png');
        this.load.image('Musuh3', 'assets/images/Musuh3.png');
        this.load.image('MusuhBos', 'assets/images/MusuhBos.png');
        this.load.image('EfekLedakan', 'assets/images/EfekLedakan.png');
        this.load.audio('snd_shoot', ['assets/audio/fx_shoot.mp3', 'assets/audio/fx_shoot.ogg']);
        this.load.audio('snd_explode', ['assets/audio/fx_explode.mp3', 'assets/audio/fx_explode.ogg']);
        this.load.audio('music_play', ['assets/audio/music_play.mp3']);
    }

    create() {
        // =====================
        // Background lapisan bawah (parallax)
        // =====================
        this.arrBGBawah = [];
        var bgBawahKeys = ['BGPlay', 'BG2', 'BG3'];

        for (var i = 0; i < 3; i++) {
            var randKey = bgBawahKeys[Phaser.Math.Between(0, bgBawahKeys.length - 1)];
            var bg = this.add.image(240, i * (-640) + 320, randKey).setOrigin(0.5, 0.5);
            bg.setDisplaySize(480, 640);
            bg.setData('speed', Phaser.Math.FloatBetween(2, 4));
            bg.setData('key', 'bgBawah');
            this.arrBGBawah.push(bg);
        }

        // =====================
        // Background lapisan atas (awan)
        // =====================
        this.arrBGAtas = [];
        for (var j = 0; j < 4; j++) {
            var cloud = this.add.image(
                Phaser.Math.Between(50, 430),
                Phaser.Math.Between(-640, 0),
                'cloud'
            ).setOrigin(0.5, 0.5);
            var scaleCloud = Phaser.Math.FloatBetween(0.2, 0.5);
            cloud.setScale(scaleCloud);
            cloud.setAlpha(0.7);
            cloud.setData('speed', Phaser.Math.FloatBetween(1, 2.5));
            this.arrBGAtas.push(cloud);
        }

        // =====================
        // Pesawat Hero
        // =====================
        var heroKeys = ['Pesawat1', 'Pesawat2'];
        this.sprHero = this.add.image(240, 520, heroKeys[currentHero]).setOrigin(0.5, 0.5);
        this.sprHero.setDisplaySize(80, 100);
        this.sprHero.setDepth(10);

        // =====================
        // Kontrol Keyboard
        // =====================
        this.cursorKeyListener = this.input.keyboard.createCursorKeys();

        // =====================
        // Kontrol Mouse / Touch
        // =====================
        this.input.on('pointermove', function(pointer) {
            if (pointer.isDown) {
                var targetX = Phaser.Math.Clamp(pointer.x, 40, 440);
                var targetY = Phaser.Math.Clamp(pointer.y, 40, 600);

                var dist = Phaser.Math.Distance.Between(this.sprHero.x, this.sprHero.y, targetX, targetY);
                var duration = dist * 1.5;

                this.tweens.add({
                    targets: this.sprHero,
                    x: targetX,
                    y: targetY,
                    duration: duration,
                    ease: 'Linear'
                });
            }
        }, this);

        // =====================
        // Pola Pergerakan Musuh
        // =====================
        // Pola 1 - masuk dari kiri atas
        this.path1 = [
            { x: -50, y: 100 },
            { x: 100, y: 150 },
            { x: 200, y: 100 },
            { x: 300, y: 200 },
            { x: 240, y: 400 },
            { x: 100, y: 550 },
            { x: -50, y: 700 }
        ];

        // Pola 2 - masuk dari kanan atas
        this.path2 = [
            { x: 530, y: 100 },
            { x: 380, y: 150 },
            { x: 280, y: 100 },
            { x: 180, y: 200 },
            { x: 240, y: 400 },
            { x: 380, y: 550 },
            { x: 530, y: 700 }
        ];

        // Pola 3 - masuk dari kiri, zig-zag
        this.path3 = [
            { x: -50, y: 200 },
            { x: 150, y: 250 },
            { x: 100, y: 350 },
            { x: 300, y: 400 },
            { x: 200, y: 500 },
            { x: 400, y: 580 },
            { x: 530, y: 700 }
        ];

        // Pola 4 - masuk dari kanan, zig-zag
        this.path4 = [
            { x: 530, y: 200 },
            { x: 330, y: 250 },
            { x: 380, y: 350 },
            { x: 180, y: 400 },
            { x: 280, y: 500 },
            { x: 80, y: 580 },
            { x: -50, y: 700 }
        ];

        this.arrPaths = [this.path1, this.path2, this.path3, this.path4];

        // =====================
        // Array Musuh
        // =====================
        this.arrEnemies = [];

        // =====================
        // Array Peluru
        // =====================
        this.arrBullets = [];

        // =====================
        // Variabel Skor
        // =====================
        this.scoreValue = 0;

        // =====================
        // Teks Skor
        // =====================
        this.txtScore = this.add.text(20, 20, 'Score: 0', {
            fontSize: '22px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.txtScore.setDepth(20);

        // =====================
        // Sound lokal
        // =====================
        this.snd_shoot = this.sound.add('snd_shoot', { volume: 0.7 });
        this.snd_explode = this.sound.add('snd_explode', { volume: 0.8 });

        // =====================
        // Music play
        // =====================
        this.music_play = this.sound.add('music_play', { loop: true, volume: 0.4 });
        if (isSoundOn) this.music_play.play();

        // =====================
        // Timer: munculkan musuh & tembakan peluru setiap 250ms
        // =====================
        this.time.addEvent({
            delay: 250,
            loop: true,
            callback: function() {
                // Tembakkan peluru
                var bullet = new Bullet();
                bullet.Bullet(this, this.sprHero.x, this.sprHero.y - 50);
                this.arrBullets.push(bullet);

                if (isSoundOn) this.snd_shoot.play();

                // Munculkan musuh (maks 3 di layar)
                var activeCount = this.arrEnemies.filter(e => e.isActive).length;
                if (activeCount < 3) {
                    var randPath = this.arrPaths[Phaser.Math.Between(0, this.arrPaths.length - 1)];
                    var enemy = new Enemy();
                    enemy.Enemy(this, randPath);
                    this.arrEnemies.push(enemy);
                }
            },
            callbackScope: this
        });
    }

    update() {
        // =====================
        // Gerakkan Background Bawah
        // =====================
        for (var i = 0; i < this.arrBGBawah.length; i++) {
            var bg = this.arrBGBawah[i];
            bg.y += bg.getData('speed');

            if (bg.y > 640 + 320) {
                // Reset ke atas
                bg.y = -640 + 320;
                var bgBawahKeys = ['BGPlay', 'BG2', 'BG3'];
                var randKey = bgBawahKeys[Phaser.Math.Between(0, bgBawahKeys.length - 1)];
                bg.setTexture(randKey);
                bg.setData('speed', Phaser.Math.FloatBetween(2, 4));
            }
        }

        // =====================
        // Gerakkan Background Atas (awan)
        // =====================
        for (var j = 0; j < this.arrBGAtas.length; j++) {
            var cloud = this.arrBGAtas[j];
            cloud.y += cloud.getData('speed');

            if (cloud.y > 700) {
                cloud.y = Phaser.Math.Between(-200, -50);
                cloud.x = Phaser.Math.Between(50, 430);
                cloud.setData('speed', Phaser.Math.FloatBetween(1, 2.5));
            }
        }

        // =====================
        // Kontrol Keyboard
        // =====================
        var speed = 7;
        if (this.cursorKeyListener.left.isDown) {
            this.sprHero.x -= speed;
        } else if (this.cursorKeyListener.right.isDown) {
            this.sprHero.x += speed;
        }
        if (this.cursorKeyListener.up.isDown) {
            this.sprHero.y -= speed;
        } else if (this.cursorKeyListener.down.isDown) {
            this.sprHero.y += speed;
        }

        // Batasi hero di dalam canvas
        this.sprHero.x = Phaser.Math.Clamp(this.sprHero.x, 40, 440);
        this.sprHero.y = Phaser.Math.Clamp(this.sprHero.y, 40, 600);

        // =====================
        // Gerakkan Musuh
        // =====================
        for (var e = 0; e < this.arrEnemies.length; e++) {
            if (this.arrEnemies[e].isActive) {
                this.arrEnemies[e].move();
            }
        }

        // Bersihkan musuh tidak aktif dari array
        this.arrEnemies = this.arrEnemies.filter(function(enemy) {
            return enemy.isActive;
        });

        // =====================
        // Gerakkan Peluru
        // =====================
        for (var b = 0; b < this.arrBullets.length; b++) {
            if (this.arrBullets[b].isActive) {
                this.arrBullets[b].move();
            }
        }

        // Bersihkan peluru tidak aktif
        this.arrBullets = this.arrBullets.filter(function(bullet) {
            return bullet.isActive;
        });

        // =====================
        // Deteksi Tabrakan Peluru vs Musuh
        // =====================
        for (var bi = 0; bi < this.arrBullets.length; bi++) {
            var bul = this.arrBullets[bi];
            if (!bul.isActive || !bul.spr) continue;

            for (var ei = 0; ei < this.arrEnemies.length; ei++) {
                var enemy = this.arrEnemies[ei];
                if (!enemy.isActive || !enemy.spr) continue;

                var dist = Phaser.Math.Distance.Between(
                    bul.spr.x, bul.spr.y,
                    enemy.spr.x, enemy.spr.y
                );

                if (dist < 45) {
                    // Efek ledakan sederhana
                    var explodeImg = this.add.image(enemy.spr.x, enemy.spr.y, 'EfekLedakan');
                    explodeImg.setDisplaySize(80, 80);
                    this.tweens.add({
                        targets: explodeImg,
                        alpha: 0,
                        scaleX: 2,
                        scaleY: 2,
                        duration: 400,
                        onComplete: function() {
                            explodeImg.destroy();
                        }
                    });

                    // Nonaktifkan musuh
                    enemy.spr.destroy();
                    enemy.spr = null;
                    enemy.isActive = false;

                    // Nonaktifkan peluru
                    bul.spr.destroy();
                    bul.spr = null;
                    bul.isActive = false;

                    // Tambah skor
                    this.scoreValue += 1;
                    this.txtScore.setText('Score: ' + this.scoreValue);

                    // Sound ledakan
                    if (isSoundOn) this.snd_explode.play();

                    break;
                }
            }
        }

        // =====================
        // Deteksi Tabrakan Hero vs Musuh (Game Over)
        // =====================
        for (var me = 0; me < this.arrEnemies.length; me++) {
            var musuh = this.arrEnemies[me];
            if (!musuh.isActive || !musuh.spr) continue;

            var distHero = Phaser.Math.Distance.Between(
                this.sprHero.x, this.sprHero.y,
                musuh.spr.x, musuh.spr.y
            );

            if (distHero < 50) {
                // Ledakan hero
                var heroExplode = this.add.image(this.sprHero.x, this.sprHero.y, 'EfekLedakan');
                heroExplode.setDisplaySize(120, 120);
                if (isSoundOn) this.snd_explode.play();

                // Stop musik
                if (this.music_play) this.music_play.stop();

                // Simpan skor dan pindah ke game over
                var finalScore = this.scoreValue;
                this.time.delayedCall(600, function() {
                    this.scene.start('SceneGameOver', { score: finalScore });
                }, [], this);
                break;
            }
        }
    }
}

