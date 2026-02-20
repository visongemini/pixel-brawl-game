class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }
    
    init(data) {
        this.selectedChar = data.selectedCharacter;
        this.gameTime = 180;
        this.isGameOver = false;
        this.autoFireTimer = null;
    }
    
    create() {
        this.add.image(320, 480, 'background');
        this.physics.world.setBounds(0, 0, 640, 960);
        
        // 创建子弹组
        this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人
        this.createEnemies();
        
        // 创建UI
        this.createUI();
        
        // 创建碰撞
        this.createCollisions();
        
        // 创建输入控制
        this.createInputs();
        
        // 开始倒计时
        this.startTimer();
        
        // 开始提示
        this.showStartHint();
        
        // 自动射击
        this.startAutoFire();
    }
    
    createPlayer() {
        this.player = new Player(this, 320, 850, this.selectedChar);
        this.player.setDepth(10);
    }
    
    createEnemies() {
        this.enemies = this.physics.add.group();
        const allChars = getAllCharacters();
        const enemyChars = allChars.filter(c => c.id !== this.selectedChar.id);
        
        enemyChars.forEach((char, i) => {
            const x = 80 + (i % 3) * 220 + Phaser.Math.Between(-30, 30);
            const y = 120 + Math.floor(i / 3) * 150 + Phaser.Math.Between(-20, 20);
            const enemy = new Enemy(this, x, y, char, this.player);
            this.enemies.add(enemy);
        });
    }
    
    createUI() {
        // 倒计时
        this.timerText = this.add.text(320, 50, '3:00', {
            fontSize: '48px',
            fill: '#ffd93d',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 敌人数量
        this.enemyText = this.add.text(20, 30, '敌人: 6', {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        });
        
        // 玩家血条
        this.playerHpText = this.add.text(620, 30, `${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        
        // 技能提示
        this.add.text(320, 880, `【右下角】${this.selectedChar.skill.name}`, {
            fontSize: '14px',
            fill: '#4ecdc4',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }
    
    createCollisions() {
        // 玩家子弹打敌人
        this.physics.add.overlap(this.bullets, this.enemies, (b, e) => {
            if (!b.active || !e.active) return;
            e.takeDamage(b.bulletDamage);
            this.createHitEffect(b.x, b.y, b.tintTopLeft || 0xffffff);
            b.destroy();
            this.updateUI();
        }, null, this);
        
        // 敌人子弹打玩家
        this.physics.add.overlap(this.enemyBullets, this.player, (b, p) => {
            if (!b.active) return;
            const dead = p.takeDamage(b.bulletDamage);
            this.createHitEffect(b.x, b.y, 0xff0000);
            b.destroy();
            this.updateUI();
            if (dead && !this.isGameOver) this.gameLose('death');
        }, null, this);
        
        // 敌人之间碰撞
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.enemies, this.player);
    }
    
    createInputs() {
        // 虚拟摇杆
        this.joystick = {
            active: false,
            baseX: 100,
            baseY: 880,
            stickX: 100,
            stickY: 880,
            maxDist: 50
        };
        
        this.joyBase = this.add.circle(100, 880, 50, 0x333333, 0.5).setStrokeStyle(2, 0x666).setDepth(100);
        this.joyStick = this.add.circle(100, 880, 22, 0x00d4aa, 0.8).setDepth(101);
        
        // 技能按钮
        this.skillBtn = this.add.circle(560, 880, 45, 0xe94560, 0.8)
            .setStrokeStyle(3, 0xff6b6b).setDepth(100)
            .setInteractive();
        
        this.add.text(560, 880, '技能', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        this.skillBtn.on('pointerdown', () => {
            if (!this.isGameOver) this.player.useSkill(this.player.x, this.player.y - 100);
            this.tweens.add({ targets: this.skillBtn, scale: 0.9, duration: 80, yoyo: true });
        });
        
        // 点击射击
        this.input.on('pointerdown', (p) => {
            if (this.isGameOver) return;
            
            if (p.x < 320) {
                // 左半边 = 摇杆
                this.joystick.active = true;
                this.updateJoystick(p.x, p.y);
            } else if (p.x < 500) {
                // 中间 = 射击
                this.autoFire();
            }
            // 右边技能按钮已经单独处理
        });
        
        this.input.on('pointermove', (p) => {
            if (this.joystick.active) this.updateJoystick(p.x, p.y);
        });
        
        this.input.on('pointerup', () => {
            this.joystick.active = false;
            this.joyStick.x = this.joystick.baseX;
            this.joyStick.y = this.joystick.baseY;
        });
    }
    
    updateJoystick(x, y) {
        const dx = x - this.joystick.baseX;
        const dy = y - this.joystick.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= this.joystick.maxDist) {
            this.joystick.stickX = x;
            this.joystick.stickY = y;
        } else {
            const angle = Math.atan2(dy, dx);
            this.joystick.stickX = this.joystick.baseX + Math.cos(angle) * this.joystick.maxDist;
            this.joystick.stickY = this.joystick.baseY + Math.sin(angle) * this.joystick.maxDist;
        }
        
        this.joyStick.x = this.joystick.stickX;
        this.joyStick.y = this.joystick.stickY;
    }
    
    autoFire() {
        let nearest = null;
        let nearestDist = Infinity;
        
        this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
            if (d < nearestDist) { nearestDist = d; nearest = e; }
        });
        
        if (nearest) {
            this.player.fire(nearest.x, nearest.y);
        } else {
            this.player.fire(this.player.x, this.player.y - 100);
        }
    }
    
    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime--;
                const m = Math.floor(this.gameTime / 60);
                const s = this.gameTime % 60;
                this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);
                
                if (this.gameTime <= 30) {
                    this.timerText.setFill('#ff0000');
                    this.tweens.add({ targets: this.timerText, scale: 1.15, duration: 150, yoyo: true });
                }
                
                if (this.gameTime <= 0 && !this.isGameOver) this.gameLose('timeout');
            },
            loop: true
        });
    }
    
    showStartHint() {
        const hint = this.add.text(320, 480, '战斗开始!', {
            fontSize: '48px',
            fill: '#ffd93d',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setScale(0);
        
        this.tweens.add({
            targets: hint,
            scale: 1,
            duration: 300,
            ease: 'Back.out',
            onComplete: () => {
                this.time.delayedCall(1200, () => {
                    this.tweens.add({ targets: hint, alpha: 0, duration: 250, onComplete: () => hint.destroy() });
                });
            }
        });
    }
    
    startAutoFire() {
        this.autoFireTimer = this.time.addEvent({
            delay: 150,
            callback: () => {
                if (!this.isGameOver) {
                    this.autoFire();
                }
            },
            loop: true
        });
    }
    
    stopAutoFire() {
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
            this.autoFireTimer = null;
        }
    }
    
    createHitEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 40 + Math.random() * 40;
            const p = this.add.circle(x, y, 4, color);
            this.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 280,
                onComplete: () => p.destroy()
            });
        }
    }
    
    updateUI() {
        const alive = this.enemies.countActive();
        this.enemyText.setText(`敌人: ${alive}`);
        this.playerHpText.setText(`${Math.max(0, this.player.hp)}/${this.player.maxHp}`);
        
        if (alive === 0 && !this.isGameOver) this.gameWin();
    }
    
    gameWin() {
        this.isGameOver = true;
        this.timerEvent.remove();
        this.stopAutoFire();
        
        // 彩花
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 640);
            const y = Phaser.Math.Between(0, 400);
            const c = Phaser.Utils.Array.GetRandom(colors);
            const conf = this.add.rectangle(x, y, 10, 10, c);
            this.tweens.add({
                targets: conf,
                y: y + 300,
                rotation: Math.PI * 2,
                alpha: 0,
                duration: 1800,
                ease: 'Power2',
                onComplete: () => conf.destroy()
            });
        }
        
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOverScene', { result: 'win', char: this.selectedChar, timeLeft: this.gameTime });
        });
    }
    
    gameLose(reason) {
        this.isGameOver = true;
        this.timerEvent.remove();
        this.stopAutoFire();
        
        const text = this.add.text(320, 480, reason === 'timeout' ? '时间到!' : '你挂了!', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setScale(0.5);
        
        this.tweens.add({ targets: text, scale: 1.2, duration: 250, ease: 'Back.out' });
        
        this.time.delayedCall(1800, () => {
            this.scene.start('GameOverScene', { result: 'lose', char: this.selectedChar, reason: reason });
        });
    }
    
    update() {
        if (this.isGameOver) return;
        
        // 摇杆移动
        if (this.joystick.active) {
            const dx = this.joystick.stickX - this.joystick.baseX;
            const dy = this.joystick.stickY - this.joystick.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) {
                this.player.setVelocity(
                    (dx / this.joystick.maxDist) * this.player.speed,
                    (dy / this.joystick.maxDist) * this.player.speed
                );
            }
        } else {
            this.player.setVelocity(0, 0);
        }
        
        // 限制玩家区域
        if (this.player.y < 600) { this.player.y = 600; this.player.setVelocityY(0); }
        if (this.player.y > 940) { this.player.y = 940; this.player.setVelocityY(0); }
        
        // 更新实体
        this.player.update();
        this.enemies.getChildren().forEach(e => { if (e.active) e.update(); });
    }
}
