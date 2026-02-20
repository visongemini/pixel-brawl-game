class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }
    
    init(data) {
        this.result = data.result;
        this.char = data.char;
        this.timeLeft = data.timeLeft;
        this.reason = data.reason;
    }
    
    create() {
        this.add.image(320, 480, 'background');
        
        const isWin = this.result === 'win';
        
        // 结果文字
        this.add.text(320, 200, isWin ? '胜利!' : '失败', {
            fontSize: '72px',
            fill: isWin ? '#ffd93d' : '#ff6b6b',
            fontStyle: 'bold',
            stroke: isWin ? '#00ff00' : '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setScale(0);
        
        this.tweens.add({
            targets: this.add.text(320, 200, isWin ? '胜利!' : '失败', {
                fontSize: '72px',
                fill: isWin ? '#ffd93d' : '#ff6b6b',
                fontStyle: 'bold',
                stroke: isWin ? '#00ff00' : '#000',
                strokeThickness: 6
            }).setOrigin(0.5),
            scale: 1,
            duration: 400,
            ease: 'Back.out'
        });
        
        // 角色信息
        const g = this.make.graphics({ add: false });
        g.fillStyle(this.char.color, 1);
        g.fillRect(0, 0, 60, 60);
        g.generateTexture('result_char', 60, 60);
        
        this.add.image(320, 350, 'result_char');
        this.add.text(320, 350, this.char.emoji, { fontSize: '36px' }).setOrigin(0.5);
        this.add.text(320, 420, this.char.name, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 补充信息
        if (isWin) {
            const m = Math.floor(this.timeLeft / 60);
            const s = this.timeLeft % 60;
            this.add.text(320, 480, `剩余时间: ${m}:${s.toString().padStart(2, '0')}`, {
                fontSize: '20px',
                fill: '#aaa'
            }).setOrigin(0.5);
        } else {
            this.add.text(320, 480, this.reason === 'timeout' ? '时间耗尽了...' : '被击败了...', {
                fontSize: '20px',
                fill: '#aaa'
            }).setOrigin(0.5);
        }
        
        // 重试按钮
        const retryBtn = this.add.rectangle(320, 600, 200, 60, 0x00d4aa, 0.9)
            .setStrokeStyle(3, 0x00ff00)
            .setInteractive();
        
        this.add.text(320, 600, '再来一局', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        retryBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        retryBtn.on('pointerover', () => retryBtn.setScale(1.05));
        retryBtn.on('pointerout', () => retryBtn.setScale(1));
    }
}
