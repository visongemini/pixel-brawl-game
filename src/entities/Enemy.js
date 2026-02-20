class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, charData, player) {
        const key = 'enemy_' + charData.id;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(charData.color, 1);
        g.fillRect(0, 0, 25, 25);
        g.generateTexture(key, 25, 25);
        
        super(scene, x, y, key);
        
        this.charData = charData;
        this.maxHp = Math.floor(charData.hp * 1.8);
        this.hp = this.maxHp;
        this.speed = charData.speed * 0.8;
        this.player = player;
        this.lastFireTime = 0;
        this.moveDir = Phaser.Math.Between(0, 1) ? 1 : -1;
        
        // UI
        this.emoji = scene.add.text(0, -18, charData.emoji, { fontSize: '14px' }).setOrigin(0.5);
        this.nameText = scene.add.text(0, -30, charData.name, { fontSize: '8px', fill: '#fff' }).setOrigin(0.5);
        this.hpBg = scene.add.rectangle(0, -38, 30, 4, 0x333333);
        this.hpBar = scene.add.rectangle(-15, -38, 30, 4, 0xff0000);
        this.hpBar.setOrigin(0, 0.5);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        
        // AI定时器
        this.scene.time.addEvent({
            delay: 1500 + Math.random() * 1500,
            callback: () => {
                if (this.active) this.moveDir = Math.random() > 0.5 ? 1 : -1;
            },
            loop: true
        });
    }
    
    update() {
        // 移动
        this.setVelocity(this.moveDir * this.speed, 0);
        
        // 边界反弹
        if (this.x < 30) { this.x = 30; this.moveDir = 1; }
        if (this.x > 610) { this.x = 610; this.moveDir = -1; }
        if (this.y < 30) { this.y = 30; this.setVelocityY(50); }
        if (this.y > 550) { this.y = 550; this.setVelocityY(-50); }
        
        // 自动射击
        const now = Date.now();
        if (now - this.lastFireTime > this.charData.weapon.cooldown * 1.5) {
            this.lastFireTime = now;
            this.fire();
        }
        
        // 更新UI位置
        this.emoji.setPosition(this.x, this.y - 18);
        this.nameText.setPosition(this.x, this.y - 30);
        this.hpBg.setPosition(this.x, this.y - 38);
        this.hpBar.setPosition(this.x - 15, this.y - 38);
    }
    
    fire() {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        const bullet = new Bullet(this.scene, this.x, this.y, this.charData.weapon.damage, this.charData.color, true);
        bullet.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        this.scene.enemyBullets.add(bullet);
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        this.updateHpBar();
        
        // 受伤闪烁
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            repeat: 2
        });
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    updateHpBar() {
        const ratio = Math.max(0, this.hp / this.maxHp);
        this.hpBar.width = 30 * ratio;
    }
    
    die() {
        // 死亡特效
        for (let i = 0; i < 10; i++) {
            const p = this.scene.add.circle(this.x, this.y, 5, this.charData.color);
            const angle = (i / 10) * Math.PI * 2;
            this.scene.tweens.add({
                targets: p,
                x: this.x + Math.cos(angle) * 80,
                y: this.y + Math.sin(angle) * 80,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => p.destroy()
            });
        }
        
        // 销毁UI
        this.emoji.destroy();
        this.nameText.destroy();
        this.hpBg.destroy();
        this.hpBar.destroy();
        
        this.destroy();
    }
}
