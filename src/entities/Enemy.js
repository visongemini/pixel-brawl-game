class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterData, player) {
        // 创建临时纹理
        const textureKey = 'enemy_' + characterData.id + '_' + Math.random().toString(36).substr(2, 9);
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(characterData.color, 1);
        graphics.fillRect(0, 0, 20, 20);
        graphics.generateTexture(textureKey, 20, 20);
        
        super(scene, x, y, textureKey);
        
        this.characterData = characterData;
        this.maxHp = characterData.hp;
        this.hp = characterData.hp;
        this.speed = characterData.speed;
        this.player = player;
        this.isEnemy = true;
        
        // 状态
        this.isSlowed = false;
        this.isStunned = false;
        this.stunEndTime = 0;
        this.slowEndTime = 0;
        this.lastFireTime = 0;
        this.lastSkillTime = 0;
        this.moveDirection = 1;
        this.changeDirTimer = null;
        
        // 3分钟版本：敌人血量增加
        this.maxHp = Math.floor(this.maxHp * 1.8);
        this.hp = this.maxHp;
        this.aiAggression = 1.3;
        
        // UI元素
        this.emojiText = scene.add.text(0, -18, characterData.emoji, {
            fontSize: '12px'
        }).setOrigin(0.5);
        
        this.nameText = scene.add.text(0, -28, characterData.name, {
            fontSize: '7px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.hpBg = scene.add.rectangle(0, -35, 25, 4, 0x333333);
        this.hpBar = scene.add.rectangle(-12.5, -35, 25, 4, 0xff0000);
        this.hpBar.setOrigin(0, 0.5);
        
        // 状态图标
        this.statusIcons = scene.add.group();
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        
        // AI行为定时器
        this.startAI();
        
        // 发光效果
        this.preFX.addGlow(characterData.color, 2, 0, false, 0.1, 5);
    }
    
    startAI() {
        // 随机移动方向
        this.changeDirTimer = this.scene.time.addEvent({
            delay: 1000 + Math.random() * 2000,
            callback: () => {
                if (this.active && !this.isStunned) {
                    this.moveDirection = Math.random() > 0.5 ? 1 : -1;
                    this.body.velocity.x = this.moveDirection * this.speed * (this.isSlowed ? 0.5 : 1);
                }
            },
            loop: true
        });
    }
    
    updateUIPosition() {
        this.emojiText.setPosition(this.x, this.y - 18);
        this.nameText.setPosition(this.x, this.y - 28);
        this.hpBg.setPosition(this.x, this.y - 35);
        this.hpBar.setPosition(this.x - 12.5, this.y - 35);
    }
    
    updateHpBar() {
        const ratio = Math.max(0, this.hp / this.maxHp);
        this.hpBar.width = 25 * ratio;
    }
    
    takeDamage(damage) {
        console.log('=== Enemy.takeDamage 被调用 ===');
        console.log('传入的 damage:', damage, typeof damage);
        console.log('当前 this.hp:', this.hp);
        
        this.hp -= damage;
        console.log('受伤后 this.hp:', this.hp);
        this.updateHpBar();
        
        // 受伤闪烁
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        // 伤害数字
        this.showDamageNumber(damage);
        
        if (this.hp <= 0) {
            this.die();
            return true; // 死亡
        }
        return false;
    }
    
    showDamageNumber(damage) {
        const damageText = this.scene.add.text(this.x, this.y - 40, `-${damage}`, {
            fontSize: '10px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1.5
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    }
    
    applySlow(duration) {
        this.isSlowed = true;
        this.slowEndTime = this.scene.time.now + duration;
        this.setTint(0x4444ff);
        
        // 添加减速图标
        const slowIcon = this.scene.add.text(this.x + 15, this.y - 35, '🐌', {
            fontSize: '8px'
        }).setOrigin(0.5);
        this.statusIcons.add(slowIcon);
        
        this.scene.time.delayedCall(duration, () => {
            this.isSlowed = false;
            this.clearTint();
            slowIcon.destroy();
        });
    }
    
    applyStun(duration) {
        this.isStunned = true;
        this.stunEndTime = this.scene.time.now + duration;
        this.body.velocity.set(0);
        this.setTint(0xffff00);
        
        // 添加眩晕图标
        const stunIcon = this.scene.add.text(this.x + 15, this.y - 35, '💫', {
            fontSize: '8px'
        }).setOrigin(0.5);
        this.statusIcons.add(stunIcon);
        
        // 眩晕星星特效
        const stars = [];
        for (let i = 0; i < 3; i++) {
            const star = this.scene.add.text(
                this.x + (i - 1) * 10, 
                this.y - 45, 
                '⭐', 
                { fontSize: '10px' }
            ).setOrigin(0.5);
            stars.push(star);
        }
        
        this.scene.time.delayedCall(duration, () => {
            this.isStunned = false;
            this.clearTint();
            stunIcon.destroy();
            stars.forEach(s => s.destroy());
        });
    }
    
    die() {
        // 死亡特效
        const particles = [];
        for (let i = 0; i < 15; i++) {
            const particle = this.scene.add.rectangle(
                this.x, this.y,
                4, 4,
                this.characterData.color
            );
            const angle = (i / 15) * Math.PI * 2;
            const speed = 100 + Math.random() * 150;
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                alpha: 0,
                scale: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // 清理UI
        this.emojiText.destroy();
        this.nameText.destroy();
        this.hpBg.destroy();
        this.hpBar.destroy();
        this.statusIcons.clear(true, true);
        
        if (this.changeDirTimer) {
            this.changeDirTimer.remove();
        }
        
        this.destroy();
    }
    
    fire() {
        const time = this.scene.time.now;
        const weapon = this.characterData.weapon;
        
        if (time - this.lastFireTime < weapon.fireRate) {
            return;
        }
        
        this.lastFireTime = time;
        
        // 计算射击角度（朝向玩家）
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.player.x, this.player.y
        );
        
        // 散射
        if (weapon.scatter) {
            for (let i = -1; i <= 1; i++) {
                this.createBullet(angle + i * 0.2);
            }
        }
        else {
            this.createBullet(angle);
        }
    }
    
    createBullet(angle) {
        const weapon = this.characterData.weapon;
        const bullet = new Bullet(this.scene, this.x, this.y, null, {
            damage: weapon.damage,
            speed: weapon.bulletSpeed,
            color: weapon.bulletColor,
            scale: weapon.bulletSize / 10,
            angle: angle,
            glow: true,
            isEnemy: true,
            owner: this,
            bulletType: weapon.wave ? 'wave' : 'normal'
        });
        
        bullet.body.setCircle(weapon.bulletSize / 2);
        
        // 添加到敌人子弹组！
        if (this.scene.enemyBullets) {
            this.scene.enemyBullets.add(bullet);
        }
        
        return bullet;
    }
    
    useSkill() {
        const time = this.scene.time.now;
        if (time - this.lastSkillTime < this.characterData.skill.cooldown) {
            return;
        }
        
        this.lastSkillTime = time;
        
        // 简化版的AI技能使用
        const skill = this.characterData.skill;
        const distToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.player.x, this.player.y
        );
        
        // 根据技能类型决定是否使用
        switch(skill.effect) {
            case 'aoe':
            case 'knockback':
                // 近距离使用
                if (distToPlayer < 200) {
                    this.executeSkill();
                }
                break;
            case 'teleport':
                // 危险时使用
                if (this.hp < this.maxHp * 0.3) {
                    this.executeSkill();
                }
                break;
            default:
                // 随机使用
                if (Math.random() > 0.7) {
                    this.executeSkill();
                }
        }
    }
    
    executeSkill() {
        // 简化的技能执行，主要是视觉效果
        const skill = this.characterData.skill;
        
        // 技能特效
        const skillText = this.scene.add.text(this.x, this.y - 45, skill.name, {
            fontSize: '8px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1.5
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: skillText,
            y: skillText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => skillText.destroy()
        });
        
        // 根据技能类型执行效果
        switch(skill.effect) {
            case 'invincible':
                this.setTint(0x808080);
                this.scene.time.delayedCall(skill.duration, () => {
                    if (this.active) this.clearTint();
                });
                break;
            case 'aoe':
                // AOE伤害玩家
                const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
                if (dist < 200) {
                    this.player.takeDamage(skill.damage * 0.5);
                }
                this.takeDamage(skill.selfDamage || 0);
                break;
            case 'slow':
                if (dist < 150) {
                    // 减速效果（通过影响玩家移动实现，这里简化）
                }
                break;
        }
    }
    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // 检查状态
        if (this.isStunned && time > this.stunEndTime) {
            this.isStunned = false;
            this.clearTint();
        }
        
        if (this.isSlowed && time > this.slowEndTime) {
            this.isSlowed = false;
            this.clearTint();
        }
        
        // 更新UI
        this.updateUIPosition();
        
        // 限制位置（上半部分）
        if (this.y > 300) {
            this.y = 300;
            this.body.velocity.y = -Math.abs(this.body.velocity.y);
        }
        if (this.y < 50) {
            this.y = 50;
            this.body.velocity.y = Math.abs(this.body.velocity.y);
        }
        if (this.y > 550) {
            this.y = 550;
            this.body.velocity.y = -Math.abs(this.body.velocity.y);
        }
        
        // AI行为
        if (!this.isStunned) {
            // 朝向玩家移动（部分概率）
            if (Math.random() < 0.02) {
                const angleToPlayer = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.player.x, this.player.y
                );
                const speed = this.speed * (this.isSlowed ? 0.5 : 1);
                this.body.velocity.x = Math.cos(angleToPlayer) * speed;
                this.body.velocity.y = Math.sin(angleToPlayer) * speed * 0.5; // 垂直移动较慢
            }
            
            // 随机射击（提高频率）
            if (Math.random() < 0.025 * this.aiAggression) {
                this.fire();
            }
            
            // 随机使用技能（提高频率）
            if (Math.random() < 0.008 * this.aiAggression) {
                this.useSkill();
            }
        }
        
        // 更新状态图标位置
        this.statusIcons.getChildren().forEach((icon, index) => {
            icon.x = this.x + 15 + index * 10;
            icon.y = this.y - 35;
        });
    }
}