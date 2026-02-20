class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, damage, color, isEnemy = false) {
        const key = 'bullet_' + Math.random().toString(36).substr(2, 9);
        const g = scene.make.graphics({ add: false });
        g.fillStyle(color, 1);
        g.fillCircle(5, 5, 5);
        g.generateTexture(key, 10, 10);
        
        super(scene, x, y, key);
        
        this.bulletDamage = damage;
        this.isEnemy = isEnemy;
        this.lifetime = 3000;
        this.spawnTime = Date.now();
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setBounce(1);
    }
    
    update() {
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.destroy();
        }
    }
}
