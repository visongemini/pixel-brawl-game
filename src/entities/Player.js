class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, charData) {
        const key = 'player_' + charData.id;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(charData.color, 1);
        g.fillRect(0, 0, 30, 30);
        g.generateTexture(key, 30, 30);
        
        super(scene, x, y, key);
        
        this.charData = charData;
        this.maxHp = charData.hp;
        this.hp = charData.hp;
        this.speed = charData.speed;
        this.lastFireTime = 0;
        this.lastSkillTime = 0;
        this.isInvincible = false;
        
        // UI
        this.emoji = scene.add.text(0, -20, charData.emoji, { fontSize: '16px' }).setOrigin(0.5);
        this.hpBg = scene.add.rectangle(0, -35, 40, 6, 0x333333);
        this.hpBar = scene.add.rectangle(-20, -35, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
    }
    
    fire(targetX, targetY) {
        const now = Date.now();
        if (now - this.lastFireTime < this.charData.weapon.cooldown) return;
        this.lastFireTime = now;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const speed = 400;
        
        const spread = this.charData.weapon.spread || 1;
        for (let i = 0; i < spread; i++) {
            const spreadAngle = angle + (i - (spread - 1) / 2) * 0.2;
            const bullet = new Bullet(this.scene, this.x, this.y, this.charData.weapon.damage, this.charData.color);
            bullet.setVelocity(Math.cos(spreadAngle) * speed, Math.sin(spreadAngle) * speed);
            this.scene.bullets.add(bullet);
        }
    }
    
    useSkill(targetX, targetY) {
        const now = Date.now();
        if (now - this.lastSkillTime < this.charData.skill.cooldown) return;
        this.lastSkillTime = now;
        
        const skill = this.charData.skill;
        
        // 技能特效
        this.scene.tweens.add({
            targets: this,
            scale: 1.3,
            duration: 100,
            yoyo: true
        });
        
        // 对最近敌人造成伤害
        let nearest = null;
        let nearestDist = Infinity;
        
        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist < nearestDist && dist < 300) {
                nearestDist = dist;
                nearest = enemy;
            }
        });
        
        if (nearest && skill.damage > 0) {
            nearest.takeDamage(skill.damage);
        }
        
        // 自伤
        if (skill.selfDamage) {
            this.hp -= skill.selfDamage;
            this.updateHpBar();
        }
        
        // 无敌
        if (skill.effect === 'invincible') {
            this.isInvincible = true;
            this.setAlpha(0.5);
            this.scene.time.delayedCall(skill.duration, () => {
                this.isInvincible = false;
                this.setAlpha(1);
            });
        }
    }
    
    takeDamage(damage) {
        if (this.isInvincible) return false;
        this.hp -= damage;
        this.updateHpBar();
        
        // 受伤闪烁
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        
        return this.hp <= 0;
    }
    
    updateHpBar() {
        const ratio = Math.max(0, this.hp / this.maxHp);
        this.hpBar.width = 40 * ratio;
        this.hpBar.fillColor = ratio > 0.6 ? 0x00ff00 : ratio > 0.3 ? 0xffff00 : 0xff0000;
    }
    
    update() {
        this.emoji.setPosition(this.x, this.y - 20);
        this.hpBg.setPosition(this.x, this.y - 35);
        this.hpBar.setPosition(this.x - 20, this.y - 35);
    }
}
