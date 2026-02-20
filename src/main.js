// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 960,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 防止右键菜单
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

// 防止空格键滚动页面
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});