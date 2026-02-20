class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // 背景
        this.add.image(480, 320, 'background');
        
        // 标题
        this.createTitle();
        
        // 角色选择
        this.createCharacterSelection();
        
        // 角色信息面板
        this.createInfoPanel();
        
        // 选中角色
        this.selectedCharacter = null;
        
        // 开始按钮
        this.createStartButton();
        
        // 装饰元素
        this.createDecorations();
    }
    
    createTitle() {
        // 主标题
        const title = this.add.text(480, 60, '像素大乱斗', {
            fontSize: '56px',
            fill: '#FFD93D',
            fontStyle: 'bold',
            stroke: '#FF6B6B',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // 副标题
        const subtitle = this.add.text(480, 120, '谁能活到最后？', {
            fontSize: '24px',
            fill: '#4ECDC4',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 标题动画
        this.tweens.add({
            targets: title,
            scale: { from: 0.8, to: 1 },
            duration: 500,
            ease: 'Back.out'
        });
        
        // 发光效果
        title.preFX.addGlow(0xFFD93D, 4, 0, false, 0.1, 10);
    }
    
    createCharacterSelection() {
        const characters = getAllCharacters();
        const startX = 150;
        const startY = 200;
        const spacingX = 110;
        const spacingY = 130;
        
        this.characterSlots = [];
        
        characters.forEach((char, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;
            
            // 创建选择框
            const slot = this.add.container(x, y);
            
            // 背景框
            const bg = this.add.rectangle(0, 0, 100, 110, 0x000000, 0.5);
            bg.setStrokeStyle(2, 0x444444);
            slot.add(bg);
            
            // 角色图像
            const charSprite = this.add.image(0, -15, 'char_' + char.id);
            charSprite.setScale(1.2);
            slot.add(charSprite);
            
            // Emoji
            const emoji = this.add.text(0, -45, char.emoji, {
                fontSize: '28px'
            }).setOrigin(0.5);
            slot.add(emoji);
            
            // 名字
            const name = this.add.text(0, 20, char.name, {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            slot.add(name);
            
            // 血量指示
            const hpText = this.add.text(0, 40, `❤️${char.hp}`, {
                fontSize: '12px',
                fill: '#ff6b6b'
            }).setOrigin(0.5);
            slot.add(hpText);
            
            // 交互
            bg.setInteractive({ useHandCursor: true });
            
            bg.on('pointerover', () => {
                this.tweens.add({
                    targets: slot,
                    scale: 1.1,
                    duration: 100
                });
                bg.setStrokeStyle(3, 0xFFD93D);
            });
            
            bg.on('pointerout', () => {
                this.tweens.add({
                    targets: slot,
                    scale: 1,
                    duration: 100
                });
                if (this.selectedCharacter !== char) {
                    bg.setStrokeStyle(2, 0x444444);
                }
            });
            
            bg.on('pointerdown', () => {
                this.selectCharacter(char, bg);
            });
            
            slot.charData = char;
            this.characterSlots.push({ slot, bg });
        });
    }
    
    selectCharacter(char, bg) {
        // 重置所有选中状态
        this.characterSlots.forEach(({ bg }) => {
            bg.setStrokeStyle(2, 0x444444);
        });
        
        // 选中当前
        bg.setStrokeStyle(4, 0x00FF00);
        this.selectedCharacter = char;
        
        // 更新信息面板
        this.updateInfoPanel(char);
        
        // 选中动画
        this.tweens.add({
            targets: bg,
            alpha: 0.7,
            duration: 100,
            yoyo: true
        });
    }
    
    createInfoPanel() {
        // 信息面板背景
        this.infoPanel = this.add.container(750, 280);
        
        const panelBg = this.add.rectangle(0, 0, 180, 300, 0x000000, 0.7);
        panelBg.setStrokeStyle(2, 0x666666);
        this.infoPanel.add(panelBg);
        
        // 占位文字
        this.infoName = this.add.text(0, -120, '选择角色', {
            fontSize: '24px',
            fill: '#FFD93D',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.infoPanel.add(this.infoName);
        
        this.infoWeapon = this.add.text(0, -60, '👆 点击左侧角色\n查看详细信息', {
            fontSize: '14px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        this.infoPanel.add(this.infoWeapon);
        
        this.infoSkill = this.add.text(0, 40, '', {
            fontSize: '14px',
            fill: '#4ECDC4',
            align: 'center',
            wordWrap: { width: 160 }
        }).setOrigin(0.5);
        this.infoPanel.add(this.infoSkill);
    }
    
    updateInfoPanel(char) {
        this.infoName.setText(`${char.emoji} ${char.name}`);
        
        const weapon = char.weapon;
        this.infoWeapon.setText(
            `【${weapon.name}】\n` +
            `${weapon.description}\n\n` +
            `💥 伤害: ${weapon.damage}\n` +
            `⚡ 攻速: ${(1000/weapon.fireRate).toFixed(1)}/s`
        );
        
        const skill = char.skill;
        this.infoSkill.setText(
            `【${skill.name}】\n` +
            `${skill.description}\n\n` +
            `⏱️ 冷却: ${skill.cooldown/1000}s`
        );
    }
    
    createStartButton() {
        this.startButton = this.add.container(480, 520);
        
        const bg = this.add.rectangle(0, 0, 200, 60, 0xFF6B6B);
        bg.setStrokeStyle(3, 0xFFFFFF);
        
        const text = this.add.text(0, 0, '开始游戏', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.startButton.add([bg, text]);
        
        bg.setInteractive({ useHandCursor: true });
        
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: this.startButton,
                scale: 1.1,
                duration: 100
            });
            bg.setFillStyle(0xFF8B94);
        });
        
        bg.on('pointerout', () => {
            this.tweens.add({
                targets: this.startButton,
                scale: 1,
                duration: 100
            });
            bg.setFillStyle(0xFF6B6B);
        });
        
        bg.on('pointerdown', () => {
            if (this.selectedCharacter) {
                this.startGame();
            } else {
                // 未选择角色提示
                this.tweens.add({
                    targets: this.infoName,
                    scale: 1.3,
                    duration: 100,
                    yoyo: true,
                    repeat: 2
                });
            }
        });
    }
    
    createDecorations() {
        // 浮动装饰
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(50, 900);
            const y = Phaser.Math.Between(400, 600);
            const emoji = ['⭐', '💥', '✨', '🎮', '🔥'][i];
            
            const deco = this.add.text(x, y, emoji, {
                fontSize: '24px'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: deco,
                y: y - 20,
                duration: 1500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        }
    }
    
    startGame() {
        // 过渡动画
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.time.delayedCall(500, () => {
            this.scene.start('GameScene', {
                selectedCharacter: this.selectedCharacter
            });
        });
    }
}