class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data) {
        this.selectedCharacter = data.selectedCharacter;
        this.gameTime = 180; // 3分钟倒计时
        this.isGameOver = false;
    }
    
    create() {
        // 背景
        this.add.image(480, 320, 'background');
        
        // 物理世界边界
        this.physics.world.setBounds(0, 0, 960, 640);
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人
        this.createEnemies();
        
        // 创建UI
        this.createUI();
        
        // 创建碰撞
        this.createCollisions();
        
        // 输入控制
        this.createInputs();
        
        // 开始倒计时
        this.startTimer();
        
        // 游戏开始提示
        this.showStartHint();
    }
    
    createPlayer() {
        this.player = new Player(this, 480, 550, this.selectedCharacter);
        this.player.setDepth(10);
        
        // 出生特效
        const spawnEffect = this.add.circle(this.player.x, this.player.y, 50, 0xFFFFFF, 0.8);
        this.tweens.add({
            targets: spawnEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => spawnEffect.destroy()
        });
    }
    
    createEnemies() {
        this.enemies = this.physics.add.group();
        
        // 获取其他6个角色
        const allChars = getAllCharacters();
        const enemyChars = allChars.filter(c => c.id !== this.selectedCharacter.id);
        
        // 随机位置生成敌人
        enemyChars.forEach((char, index) => {
            const x = 100 + (index % 3) * 300 + Phaser.Math.Between(-50, 50);
            const y = 80 + Math.floor(index / 3) * 120 + Phaser.Math.Between(-30, 30);
            
            const enemy = new Enemy(this, x, y, char, this.player);
            enemy.setDepth(10);
            this.enemies.add(enemy);
            
            // 出生特效
            const spawnEffect = this.add.circle(x, y, 40, char.color, 0.6);
            this.tweens.add({
                targets: spawnEffect,
                scale: 1.5,
                alpha: 0,
                duration: 400,
                onComplete: () => spawnEffect.destroy()
            });
        });
    }
    
    createUI() {
        // 倒计时
        this.timerText = this.add.text(480, 30, '180', {
            fontSize: '48px',
            fill: '#FFD93D',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 倒计时标签
        this.add.text(480, 65, '秒', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 剩余敌人
        this.enemyText = this.add.text(50, 30, `敌人: ${this.enemies.countActive()}`, {
            fontSize: '20px',
            fill: '#FF6B6B',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        // 技能提示
        this.skillHint = this.add.text(480, 600, `【空格】${this.selectedCharacter.skill.name}`, {
            fontSize: '16px',
            fill: '#4ECDC4',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // 玩家血条（大）
        this.playerHpBg = this.add.rectangle(850, 30, 150, 20, 0x333333);
        this.playerHpBar = this.add.rectangle(775, 30, 150, 20, 0x00FF00);
        this.playerHpBar.setOrigin(0, 0.5);
        
        this.playerHpText = this.add.text(850, 55, `${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
    
    updateUI() {
        // 更新敌人数量
        const aliveEnemies = this.enemies.countActive();
        this.enemyText.setText(`敌人: ${aliveEnemies}`);
        
        // 更新玩家血条
        const hpRatio = this.player.hp / this.player.maxHp;
        this.playerHpBar.width = 150 * hpRatio;
        this.playerHpText.setText(`${Math.max(0, this.player.hp)}/${this.player.maxHp}`);
        
        // 改变血条颜色
        if (hpRatio > 0.6) {
            this.playerHpBar.fillColor = 0x00FF00;
        } else if (hpRatio > 0.3) {
            this.playerHpBar.fillColor = 0xFFFF00;
        } else {
            this.playerHpBar.fillColor = 0xFF0000;
        }
        
        // 检查胜利条件
        if (aliveEnemies === 0 && !this.isGameOver) {
            this.gameWin();
        }
    }
    
    createCollisions() {
        // 玩家子弹击中敌人
        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            this.hitEnemy,
            null,
            this
        );
        
        // 敌人子弹击中玩家
        this.physics.add.overlap(
            this.enemyBullets,
            this.player,
            this.hitPlayer,
            null,
            this
        );
        
        // 敌人和敌人之间碰撞
        this.physics.add.collider(this.enemies, this.enemies);
        
        // 敌人和玩家碰撞
        this.physics.add.collider(this.enemies, this.player);
    }
    
    createInputs() {
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // 技能键
        this.skillKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 鼠标射击
        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && this.player.active) {
                this.player.fire(pointer.worldX, pointer.worldY);
            }
        });
        
        // 技能释放
        this.skillKey.on('down', () => {
            if (!this.isGameOver && this.player.active) {
                const pointer = this.input.activePointer;
                this.player.useSkill(pointer.worldX, pointer.worldY);
            }
        });
        
        // 创建子弹组
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
        
        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
    }
    
    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime--;
                // 格式化为分:秒
                const minutes = Math.floor(this.gameTime / 60);
                const seconds = this.gameTime % 60;
                this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                
                // 时间警告
                if (this.gameTime <= 30) {
                    this.timerText.setFill('#FF0000');
                    this.tweens.add({
                        targets: this.timerText,
                        scale: 1.2,
                        duration: 200,
                        yoyo: true
                    });
                }
                
                // 时间到
                if (this.gameTime <= 0 && !this.isGameOver) {
                    this.gameLose('timeout');
                }
            },
            loop: true
        });
    }
    
    showStartHint() {
        const hint = this.add.text(480, 320, '战斗开始!', {
            fontSize: '48px',
            fill: '#FFD93D',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        hint.setScale(0);
        
        this.tweens.add({
            targets: hint,
            scale: 1,
            duration: 300,
            ease: 'Back.out',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: hint,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => hint.destroy()
                    });
                });
            }
        });
    }
    
    hitEnemy(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;
        
        const isDead = enemy.takeDamage(bullet.damage);
        bullet.destroy();
        
        // 击中特效
        this.createHitEffect(bullet.x, bullet.y, bullet.fillColor);
        
        // 更新UI
        this.updateUI();
    }
    
    hitPlayer(bullet, player) {
        if (!bullet.active || !player.active) return;
        
        const result = player.takeDamage(bullet.damage);
        bullet.destroy();
        
        // 击中特效
        this.createHitEffect(bullet.x, bullet.y, 0xFF0000);
        
        // 更新UI
        this.updateUI();
        
        // 检查死亡
        if (player.hp <= 0 && !this.isGameOver) {
            this.gameLose('death');
        }
    }
    
    createHitEffect(x, y, color) {
        // 爆炸粒子
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const particle = this.add.circle(x, y, 4, color);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    gameWin() {
        this.isGameOver = true;
        this.timerEvent.remove();
        
        // 胜利特效
        this.createVictoryEffect();
        
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOverScene', {
                result: 'win',
                character: this.selectedCharacter,
                timeLeft: this.gameTime
            });
        });
    }
    
    gameLose(reason) {
        this.isGameOver = true;
        this.timerEvent.remove();
        
        // 失败提示
        const loseText = this.add.text(480, 320, 
            reason === 'timeout' ? '时间到!' : '你挂了!', {
            fontSize: '64px',
            fill: '#FF0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: loseText,
            scale: { from: 0.5, to: 1.2 },
            duration: 300,
            ease: 'Back.out'
        });
        
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOverScene', {
                result: 'lose',
                character: this.selectedCharacter,
                reason: reason
            });
        });
    }
    
    createVictoryEffect() {
        // 彩花效果
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const confetti = this.add.rectangle(x, y, 10, 10, color);
            confetti.rotation = Math.random() * Math.PI;
            
            this.tweens.add({
                targets: confetti,
                y: y + 200,
                rotation: confetti.rotation + Math.PI * 2,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => confetti.destroy()
            });
        }
        
        // 胜利文字
        const victoryText = this.add.text(480, 320, '胜利!', {
            fontSize: '80px',
            fill: '#FFD93D',
            fontStyle: 'bold',
            stroke: '#00FF00',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        victoryText.setScale(0);
        this.tweens.add({
            targets: victoryText,
            scale: 1,
            duration: 500,
            ease: 'Elastic.out'
        });
    }
    
    update() {
        if (this.isGameOver || !this.player.active) return;
        
        // 玩家移动
        const speed = this.player.speed;
        let vx = 0;
        let vy = 0;
        
        // 键盘输入
        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;
        
        this.player.body.velocity.x = vx;
        this.player.body.velocity.y = vy;
        
        // 限制玩家在底部区域
        if (this.player.y < 350) {
            this.player.y = 350;
            this.player.body.velocity.y = 0;
        }
        if (this.player.y > 620) {
            this.player.y = 620;
            this.player.body.velocity.y = 0;
        }
        
        // 更新UI
        this.updateUI();
    }
}