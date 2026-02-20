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
        
        // ===== 先创建子弹组！必须在碰撞设置之前 =====
        this.createInputs();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人
        this.createEnemies();
        
        // 创建UI
        this.createUI();
        
        // 创建碰撞
        this.createCollisions();
        
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
        this.skillHint = this.add.text(480, 600, `【点击右下角按钮】${this.selectedCharacter.skill.name}`, {
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
        // 玩家子弹击中敌人 - 最简单直接的方式！
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
        // 创建子弹组（必须先创建，后面碰撞检测要用）
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
        
        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // ===== 触屏控制 =====
        const width = this.scale.width;
        const height = this.scale.height;
        
        // 虚拟摇杆（左半边屏幕）
        this.joystick = {
            active: false,
            baseX: 120,
            baseY: height - 120,
            stickX: 120,
            stickY: height - 120,
            maxDist: 60,
            pointer: null
        };
        
        // 摇杆底座
        this.joystickBase = this.add.circle(this.joystick.baseX, this.joystick.baseY, 60, 0x333333, 0.5);
        this.joystickBase.setStrokeStyle(3, 0x666666);
        this.joystickBase.setDepth(100);
        
        // 摇杆头
        this.joystickStick = this.add.circle(this.joystick.stickX, this.joystick.stickY, 25, 0x00d4aa, 0.8);
        this.joystickStick.setDepth(101);
        
        // 技能按钮（右下角）
        this.skillBtn = this.add.circle(width - 80, height - 80, 50, 0xe94560, 0.8);
        this.skillBtn.setStrokeStyle(4, 0xff6b6b);
        this.skillBtn.setDepth(100);
        
        this.skillBtnText = this.add.text(width - 80, height - 80, '技能', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        // 射击区域提示（右半边）
        this.shootHint = this.add.text(width - 120, height - 200, '点击射击', {
            fontSize: '16px',
            fill: '#ffffff',
            alpha: 0.5
        }).setOrigin(0.5).setDepth(100);
        
        // 触屏事件处理
        this.input.on('pointerdown', (pointer) => {
            if (this.isGameOver || !this.player.active) return;
            
            const x = pointer.x;
            const y = pointer.y;
            const centerX = width / 2;
            
            // 左半边 = 摇杆
            if (x < centerX) {
                this.joystick.active = true;
                this.joystick.pointer = pointer;
                this.updateJoystick(pointer.x, pointer.y);
            }
            // 右半边 = 射击（点击即可，自动瞄准）
            else {
                // 检查是否点到技能按钮
                const distToSkill = Phaser.Math.Distance.Between(x, y, width - 80, height - 80);
                if (distToSkill < 60) {
                    this.fireSkill();
                } else {
                    this.autoFire();
                }
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.joystick.active && this.joystick.pointer === pointer) {
                this.updateJoystick(pointer.x, pointer.y);
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.joystick.pointer === pointer) {
                this.joystick.active = false;
                this.joystick.pointer = null;
                // 摇杆复位
                this.joystickStick.x = this.joystick.baseX;
                this.joystickStick.y = this.joystick.baseY;
            }
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
        
        this.joystickStick.x = this.joystick.stickX;
        this.joystickStick.y = this.joystick.stickY;
    }
    
    autoFire() {
        // 自动瞄准最近的敌人
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            this.player.fire(nearestEnemy.x, nearestEnemy.y);
        } else {
            // 没有敌人就向前射
            this.player.fire(this.player.x, this.player.y - 100);
        }
    }
    
    fireSkill() {
        // 自动瞄准最近的敌人释放技能
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            this.player.useSkill(nearestEnemy.x, nearestEnemy.y);
        } else {
            this.player.useSkill(this.player.x, this.player.y - 100);
        }
        
        // 按钮按下效果
        this.tweens.add({
            targets: this.skillBtn,
            scale: 0.9,
            duration: 50,
            yoyo: true
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
        
        // 直接使用固定伤害值，确保伤害一定生效！
        const damage = 15;
        enemy.takeDamage(damage);
        
        // 击中特效
        const hitColor = bullet.tintTopLeft || 0xFFFFFF;
        this.createHitEffect(bullet.x, bullet.y, hitColor);
        
        bullet.destroy();
        
        // 更新UI
        this.updateUI();
    }
    
    hitPlayer(bullet, player) {
        if (!bullet.active || !player.active) return;
        
        const result = player.takeDamage(bullet.bulletDamage);
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
        
        // ===== 摇杆控制移动 =====
        const speed = this.player.speed;
        let vx = 0;
        let vy = 0;
        
        if (this.joystick.active) {
            const dx = this.joystick.stickX - this.joystick.baseX;
            const dy = this.joystick.stickY - this.joystick.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) {
                // 归一化并应用速度
                vx = (dx / this.joystick.maxDist) * speed;
                vy = (dy / this.joystick.maxDist) * speed;
            }
        }
        
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