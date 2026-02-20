// 角色数据
function getAllCharacters() {
    return [
        {
            id: 'vison',
            name: 'Vison',
            hp: 150,
            speed: 200,
            color: 0x00d4aa,
            emoji: '🍌',
            weapon: { damage: 18, cooldown: 300 },
            skill: { name: '画大饼', damage: 45, cooldown: 5000, effect: 'slow' }
        },
        {
            id: 'matt',
            name: 'Matt',
            hp: 180,
            speed: 150,
            color: 0xe94560,
            emoji: '⌨️',
            weapon: { damage: 14, cooldown: 400, spread: 3 },
            skill: { name: '删库跑路', damage: 55, cooldown: 6000, effect: 'dash' }
        },
        {
            id: 'vina',
            name: 'Vina',
            hp: 140,
            speed: 280,
            color: 0xff6b6b,
            emoji: '🎸',
            weapon: { damage: 12, cooldown: 200 },
            skill: { name: '奶茶轰炸', damage: 0, cooldown: 7000, effect: 'stun' }
        },
        {
            id: 'coco',
            name: 'Coco',
            hp: 130,
            speed: 290,
            color: 0xffd93d,
            emoji: '📝',
            weapon: { damage: 10, cooldown: 350, wave: true },
            skill: { name: '萌力咆哮', damage: 25, cooldown: 5000, effect: 'knockback' }
        },
        {
            id: 'cola',
            name: 'Cola',
            hp: 220,
            speed: 120,
            color: 0x6c5ce7,
            emoji: '🥤',
            weapon: { damage: 22, cooldown: 500 },
            skill: { name: '曼妥思爆炸', damage: 70, cooldown: 8000, effect: 'aoe', selfDamage: 15 }
        },
        {
            id: 'andy',
            name: 'Andy',
            hp: 160,
            speed: 200,
            color: 0x00cec9,
            emoji: '🐛',
            weapon: { damage: 16, cooldown: 400, homing: true },
            skill: { name: '强行重启', damage: 0, cooldown: 9000, effect: 'blackout' }
        },
        {
            id: 'rocky',
            name: 'Rocky',
            hp: 200,
            speed: 140,
            color: 0xfdcb6e,
            emoji: '🧱',
            weapon: { damage: 26, cooldown: 600 },
            skill: { name: '坚如磐石', damage: 0, cooldown: 10000, effect: 'invincible', duration: 4000 }
        }
    ];
}
