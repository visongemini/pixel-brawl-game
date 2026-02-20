class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    
    create() {
        this.add.image(320, 480, 'background');
        
        // 标题
        this.add.text(320, 100, '像素大乱斗', {
            fontSize: '48px',
            fill: '#ffd93d',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.add.text(320, 150, '谁能活到最后？', {
            fontSize: '20px',
            fill: '#aaa'
        }).setOrigin(0.5);
        
        // 角色选择
        this.add.text(320, 220, '选择你的角色', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const chars = getAllCharacters();
        chars.forEach((char, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = 120 + col * 200;
            const y = 300 + row * 130;
            
            // 背景框
            const btn = this.add.rectangle(x, y, 160, 110, 0x333333, 0.8)
                .setStrokeStyle(2, char.color)
                .setInteractive();
            
            // 头像
            const g = this.make.graphics({ add: false });
            g.fillStyle(char.color, 1);
            g.fillRect(0, 0, 40, 40);
            g.generateTexture('char_' + char.id, 40, 40);
            this.add.image(x, y - 20, 'char_' + char.id);
            
            // Emoji
            this.add.text(x, y - 20, char.emoji, { fontSize: '24px' }).setOrigin(0.5);
            
            // 名字
            this.add.text(x, y + 20, char.name, {
                fontSize: '18px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // 属性
            this.add.text(x, y + 45, `❤️${char.hp} ⚡${char.speed}`, {
                fontSize: '12px',
                fill: '#aaa'
            }).setOrigin(0.5);
            
            // 点击事件
            btn.on('pointerdown', () => {
                this.scene.start('GameScene', { selectedCharacter: char });
            });
            
            btn.on('pointerover', () => btn.setScale(1.05));
            btn.on('pointerout', () => btn.setScale(1));
        });
        
        // 操作说明
        this.add.text(320, 850, '左摇杆移动 | 右屏点击射击 | 右下角技能', {
            fontSize: '14px',
            fill: '#888'
        }).setOrigin(0.5);
        
        this.add.text(620, 20, 'v2.0', {
            fontSize: '16px',
            fill: '#666'
        }).setOrigin(1, 0);
    }
}
