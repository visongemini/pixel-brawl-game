// 角色数据配置 - 3分钟战斗版本（平衡调整）
const CHARACTERS = {
    vison: {
        id: 'vison',
        name: 'Vison',
        hp: 150,
        speed: 200,
        color: 0xFF6B6B,
        emoji: '👁️',
        weapon: {
            name: '死亡注视',
            description: '从眼睛发射两道发光的像素马赛克激光',
            damage: 18,  // 提升
            fireRate: 280,  // 稍微加快
            bulletColor: 0xFF00FF,
            bulletSize: 6,
            bulletSpeed: 500,
            doubleShot: true
        },
        skill: {
            name: '画大饼',
            description: '扔出巨大发光大饼，减速+伤害',
            cooldown: 6000,  // 稍微延长
            damage: 45,  // 提升
            duration: 3000,
            color: 0xFFD93D,
            effect: 'slow'
        }
    },
    matt: {
        id: 'matt',
        name: 'Matt',
        hp: 180,  // 提升
        speed: 150,
        color: 0x4ECDC4,
        emoji: '⌨️',
        weapon: {
            name: '键盘侠之怒',
            description: '丢出机械键盘的键帽（WASD字母）',
            damage: 14,  // 提升
            fireRate: 220,  // 加快
            bulletColor: 0x95E1D3,
            bulletSize: 8,
            bulletSpeed: 450,
            scatter: true
        },
        skill: {
            name: '删库跑路',
            description: '短距离闪现，原地留下爆炸报错弹窗',
            cooldown: 6000,
            damage: 55,  // 提升
            range: 150,
            effect: 'teleport'
        }
    },
    vina: {
        id: 'vina',
        name: 'Vina',
        hp: 140,  // 提升
        speed: 300,
        color: 0xFF8B94,
        emoji: '📱',
        weapon: {
            name: '夺命连环Call',
            description: '发射一串刺耳的像素手机图标',
            damage: 12,  // 提升
            fireRate: 160,  // 更快
            bulletColor: 0xFFB6C1,
            bulletSize: 10,
            bulletSpeed: 400,
            rapidFire: true
        },
        skill: {
            name: '奶茶轰炸',
            description: '三杯珍珠奶茶从天而降，粘住敌人2秒',
            cooldown: 6000,
            damage: 30,  // 每杯10点
            duration: 2000,  // 延长
            effect: 'stun'
        }
    },
    coco: {
        id: 'coco',
        name: 'Coco',
        hp: 130,  // 提升
        speed: 320,
        color: 0xFFA07A,
        emoji: '🐱',
        weapon: {
            name: '猫毛攻击',
            description: '发射毛线球，弹道呈波浪形',
            damage: 10,  // 提升
            fireRate: 130,  // 更快
            bulletColor: 0xFFC0CB,
            bulletSize: 12,
            bulletSpeed: 350,
            wave: true
        },
        skill: {
            name: '萌力咆哮',
            description: '超大声喵/汪，震退敌人+眩晕',
            cooldown: 5500,
            damage: 25,  // 提升
            range: 200,
            effect: 'knockback'
        }
    },
    cola: {
        id: 'cola',
        name: 'Cola',
        hp: 220,  // 大幅提升（肉盾）
        speed: 100,
        color: 0x98FB98,
        emoji: '🥤',
        weapon: {
            name: '碳酸子弹',
            description: '吐出绿色带气泡的汽水滴',
            damage: 22,  // 提升
            fireRate: 380,
            bulletColor: 0x00FF7F,
            bulletSize: 14,
            bulletSpeed: 300,
            bubble: true
        },
        skill: {
            name: '曼妥思大爆炸',
            description: '向四周喷射高压可乐柱，全屏AOE，自损15血',
            cooldown: 8000,  // 较长CD
            damage: 70,  // 强力AOE
            selfDamage: 15,
            range: 400,
            effect: 'aoe'
        }
    },
    andy: {
        id: 'andy',
        name: 'Andy',
        hp: 160,  // 提升
        speed: 220,
        color: 0x87CEEB,
        emoji: '🐛',
        weapon: {
            name: 'Bug满天飞',
            description: '射出绿色的虫子图标',
            damage: 16,  // 提升
            fireRate: 250,
            bulletColor: 0x32CD32,
            bulletSize: 9,
            bulletSpeed: 420,
            homing: true
        },
        skill: {
            name: '强行重启',
            description: '让瞄准的敌人黑屏3秒（暂停行动）',
            cooldown: 7000,  // 较长CD
            duration: 3000,  // 延长控制
            effect: 'blackout'
        }
    },
    rocky: {
        id: 'rocky',
        name: 'Rocky',
        hp: 200,  // 提升
        speed: 130,
        color: 0xDDA0DD,
        emoji: '🪨',
        weapon: {
            name: '物理说服',
            description: '扔出各种形状的板砖和石头',
            damage: 26,  // 高伤害但慢
            fireRate: 550,
            bulletColor: 0x808080,
            bulletSize: 16,
            bulletSpeed: 380,
            heavy: true
        },
        skill: {
            name: '坚如磐石',
            description: '变巨石4秒，免疫伤害并反弹子弹',
            cooldown: 10000,  // 最长CD
            duration: 4000,  // 延长无敌
            effect: 'invincible'
        }
    }
};

// 获取所有角色数组
function getAllCharacters() {
    return Object.values(CHARACTERS);
}

// 根据ID获取角色
function getCharacterById(id) {
    return CHARACTERS[id];
}