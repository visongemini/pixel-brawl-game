class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    
    preload() {
        // 创建背景纹理
        const g = this.make.graphics({ add: false });
        
        // 背景
        g.fillStyle(0x1a1a2e, 1);
        g.fillRect(0, 0, 640, 960);
        
        // 网格
        g.lineStyle(1, 0x333333, 0.5);
        for (let x = 0; x < 640; x += 40) {
            g.moveTo(x, 0);
            g.lineTo(x, 960);
        }
        for (let y = 0; y < 960; y += 40) {
            g.moveTo(0, y);
            g.lineTo(640, y);
        }
        g.strokePath();
        
        // 星星
        g.fillStyle(0xffffff, 0.8);
        for (let i = 0; i < 50; i++) {
            g.fillRect(Math.random() * 640, Math.random() * 960, 2, 2);
        }
        
        g.generateTexture('background', 640, 960);
    }
    
    create() {
        this.add.text(320, 480, '加载中...', { 
            fontSize: '32px', fill: '#fff', fontStyle: 'bold' 
        }).setOrigin(0.5);
        
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
