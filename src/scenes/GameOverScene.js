class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        this.result = data.result;
        this.character = data.character;
        this.timeLeft = data.timeLeft || 0;
        this.reason = data.reason || '';
    }
    
    create() {
        // 背景
        this.add.image(320, 480, 'background');
        
        // 根据结果显示不同内容
        if (this.result === 'win') {
            this.createVictoryScreen();
        } else {
            this.createDefeatScreen();
        }
        
        // 创建按钮
        this.createButtons();
        
        // 装饰
        this.createDecorations();
    }
    
    createVictoryScreen() {
        // 大标题
        const title = this.add.text(320, 120, '🎉 胜利! 🎉', {
            fontSize: '56px',
            fill: '#FFD93D',
            fontStyle: 'bold',
            stroke: '#00FF00',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: title,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Elastic.out'
        });
        
        // 角色展示
        const charSprite = this.add.image(320, 300, 'char_' + this.character.id);
        charSprite.setScale(2);
        
        // 发光效果
        const glow = this.add.circle(320, 300, 60, 0xFFD93D, 0.3);
        this.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            repeat: -1
        });
        
        // 角色名字
        this.add.text(320, 400, `${this.character.emoji} ${this.character.name}`, {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 胜利信息
        this.add.text(320, 450, `剩余时间: ${this.timeLeft}秒`, {
            fontSize: '22px',
            fill: '#4ECDC4'
        }).setOrigin(0.5);
        
        // 评价
        let rating = '⭐⭐⭐';
        let comment = '完美! 你是像素大乱斗之王!';
        
        if (this.timeLeft > 40) {
            rating = '⭐⭐⭐⭐⭐';
            comment = '神级操作! 碾压全场!';
        } else if (this.timeLeft > 20) {
            rating = '⭐⭐⭐⭐';
            comment = '精彩表现! 实至名归!';
        } else if (this.timeLeft > 5) {
            comment = '不错的战斗! 再接再厉!';
        } else {
            rating = '⭐⭐';
            comment = '险胜! 下次要更加小心!';
        }
        
        this.add.text(320, 510, rating, {
            fontSize: '36px'
        }).setOrigin(0.5);
        
        this.add.text(320, 570, comment, {
            fontSize: '18px',
            fill: '#FF8B94',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    createDefeatScreen() {
        // 大标题
        const title = this.add.text(320, 120, '💀 失败 💀', {
            fontSize: '56px',
            fill: '#FF6B6B',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: title,
            y: 130,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        // 角色展示（灰度）
        const charSprite = this.add.image(320, 300, 'char_' + this.character.id);
        charSprite.setScale(2);
        charSprite.setTint(0x666666);
        
        // 角色名字
        this.add.text(320, 400, `${this.character.emoji} ${this.character.name}`, {
            fontSize: '28px',
            fill: '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 失败原因
        const reasonText = this.reason === 'timeout' 
            ? '⏰ 时间到! 还有敌人存活'
            : '💔 你的血量耗尽了';
        
        this.add.text(320, 450, reasonText, {
            fontSize: '22px',
            fill: '#FF6B6B'
        }).setOrigin(0.5);
        
        // 鼓励的话
        const encouragements = [
            '别灰心，下次再来!',
            '失败是成功之母!',
            '换个角色试试?',
            '熟能生巧，继续练习!',
            '你的敌人太狡猾了!'
        ];
        
        const comment = Phaser.Utils.Array.GetRandom(encouragements);
        
        this.add.text(320, 510, comment, {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        // 死亡统计
        this.add.text(320, 570, '建议: 多使用技能，注意躲避', {
            fontSize: '16px',
            fill: '#4ECDC4'
        }).setOrigin(0.5);
    }
    
    createButtons() {
        // 再来一局按钮
        const restartBtn = this.add.container(320, 700);
        
        const restartBg = this.add.rectangle(0, 0, 160, 50, 0x4ECDC4);
        restartBg.setStrokeStyle(3, 0xFFFFFF);
        
        const restartText = this.add.text(0, 0, '🔄 再来一局', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        restartBtn.add([restartBg, restartText]);
        
        restartBg.setInteractive({ useHandCursor: true });
        
        restartBg.on('pointerover', () => {
            this.tweens.add({
                targets: restartBtn,
                scale: 1.1,
                duration: 100
            });
            restartBg.setFillStyle(0x5EDDD4);
        });
        
        restartBg.on('pointerout', () => {
            this.tweens.add({
                targets: restartBtn,
                scale: 1,
                duration: 100
            });
            restartBg.setFillStyle(0x4ECDC4);
        });
        
        restartBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });
        
        // 选择角色按钮
        const menuBtn = this.add.container(320, 780);
        
        const menuBg = this.add.rectangle(0, 0, 160, 50, 0xFF6B6B);
        menuBg.setStrokeStyle(3, 0xFFFFFF);
        
        const menuText = this.add.text(0, 0, '🎮 主菜单', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        menuBtn.add([menuBg, menuText]);
        
        menuBg.setInteractive({ useHandCursor: true });
        
        menuBg.on('pointerover', () => {
            this.tweens.add({
                targets: menuBtn,
                scale: 1.1,
                duration: 100
            });
            menuBg.setFillStyle(0xFF8B8B);
        });
        
        menuBg.on('pointerout', () => {
            this.tweens.add({
                targets: menuBtn,
                scale: 1,
                duration: 100
            });
            menuBg.setFillStyle(0xFF6B6B);
        });
        
        menuBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });
    }
    
    createDecorations() {
        // 浮动emoji
        const emojis = this.result === 'win' 
            ? ['🎉', '🏆', '⭐', '✨', '💎']
            : ['💀', '😢', '💔', '😔', '🥀'];
        
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, 590);
            const y = Phaser.Math.Between(200, 700);
            const emoji = this.add.text(x, y, Phaser.Utils.Array.GetRandom(emojis), {
                fontSize: '32px',
                alpha: 0.5
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: emoji,
                y: y - 30,
                rotation: Math.random() * 0.5 - 0.25,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        }
    }
}