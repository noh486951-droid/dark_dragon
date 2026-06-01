// ==========================================
// 遊戲配置與全域變數
// ==========================================

// 音效管理器 (Web Audio API 合成經典楓之谷音效)
const SoundManager = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    play(type) {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
            case 'jump': // 跳躍音效：頻率快速上揚
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'teleport': // 順移音效：科幻脈衝聲
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.setValueAtTime(800, now + 0.05);
                osc.frequency.setValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'dash': // 衝刺/突進音效：白噪音爆炸感
                // 用三角波加高頻模擬風壓聲
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(300, now + 0.2);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'attack': // 揮刀空揮聲
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hit': // 擊中龍王頭部：金屬重擊爆破
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
                
                // 增加一個高頻金屬擦擊聲
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(1200, now);
                osc2.frequency.linearRampToValueAtTime(600, now + 0.08);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                gain2.gain.setValueAtTime(0.06, now);
                gain2.gain.linearRampToValueAtTime(0, now + 0.08);
                osc2.start(now);
                osc2.stop(now + 0.08);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            case 'warning': // 警報音效
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            case 'lightning': // 雷擊：低沉雷聲
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(60, now);
                osc.frequency.linearRampToValueAtTime(10, now + 0.6);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'chain': { // 鐵鍊重擊金屬聲
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
                
                // 添加些微雜訊感
                const osc2 = this.ctx.createOscillator();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(500, now);
                osc2.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                osc2.connect(gain);
                osc2.start(now);
                osc2.stop(now + 0.3);

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
            case 'hurt': // 玩家受傷：哀鳴聲
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'win': // 勝利音樂：經典大調琶音
                const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C大調和弦
                notes.forEach((freq, idx) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.08);
                    g.gain.setValueAtTime(0.05, now + idx * 0.08);
                    g.gain.linearRampToValueAtTime(0, now + idx * 0.08 + 0.4);
                    o.start(now + idx * 0.08);
                    o.stop(now + idx * 0.08 + 0.4);
                });
                break;
            case 'lose': // 失敗音樂：悲傷小調琶音下行
                const loseNotes = [392.00, 349.23, 311.13, 261.63, 196.00];
                loseNotes.forEach((freq, idx) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    o.type = 'sawtooth';
                    o.frequency.setValueAtTime(freq, now + idx * 0.12);
                    g.gain.setValueAtTime(0.06, now + idx * 0.12);
                    g.gain.linearRampToValueAtTime(0, now + idx * 0.12 + 0.5);
                    o.start(now + idx * 0.12);
                    o.stop(now + idx * 0.12 + 0.5);
                });
                break;
        }
    }
};

// 職業類型定義與技能設定 (不要寫死，方便擴充)
const JobConfigs = {
    warrior: {
        className: "戰士",
        speed: 2.2,
        jumpForce: 9,
        attackRange: 130,
        attackCooldown: 550,
        skillCooldown: 3000,
        color: "#f87171",
        description: "突進 (Shift)：高速水平突進 150px。只能在站立時發動。",
        initSkill(player) {
            player.skillActive = false;
        },
        useSkill(player) {
            if (!player.isGrounded || player.isClimbing) return false;
            player.isSkillDashing = true;
            player.skillDashTicks = 10; // 突進持續 10 幀
            player.skillCooldownTimer = this.skillCooldown;
            SoundManager.play('dash');
            return true;
        },
        updateSkill(player) {
            if (player.isSkillDashing) {
                player.vx = 18 * player.facing; // 每幀前進 18px (共180px，扣除摩擦阻力約150px)
                player.skillDashTicks--;
                if (player.skillDashTicks <= 0) {
                    player.isSkillDashing = false;
                }
            }
        },
        drawSkill(ctx, player) {
            if (player.isSkillDashing) {
                // 繪製突進黃色殘影與衝刺風壓
                ctx.fillStyle = "rgba(251, 191, 36, 0.4)";
                ctx.beginPath();
                ctx.ellipse(player.x + player.width/2 - player.facing * 30, player.y + player.height/2, 35, 20, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
                ctx.beginPath();
                ctx.ellipse(player.x + player.width/2 - player.facing * 60, player.y + player.height/2, 25, 12, 0, 0, Math.PI*2);
                ctx.fill();
            }
        }
    },
    mage: {
        className: "法師",
        speed: 1.9,
        jumpForce: 8.5,
        attackRange: 280,
        attackCooldown: 650,
        skillCooldown: 800, // 順移 CD 極短
        color: "#22d3ee",
        description: "順移 (Shift)：按住方向鍵 (← → ↑ ↓) + Shift，瞬間移動 120px，無視沿途傷害。",
        initSkill(player) {},
        useSkill(player) {
            let dx = 0;
            let dy = 0;
            if (keys['ArrowLeft'] || keys['a']) dx = -120;
            else if (keys['ArrowRight'] || keys['d']) dx = 120;
            else if (keys['ArrowUp'] || keys['w']) dy = -160; // 微調垂直瞬移距離
            else if (keys['ArrowDown'] || keys['s']) dy = 160; // 微調垂直瞬移距離
            else {
                // 預設朝玩家面對方向順移
                dx = 120 * player.facing;
            }

            // 執行順移
            const targetX = player.x + dx;
            const targetY = player.y + dy;

            // 邊界限制 (下邊界使用最底層地面 585 作為基準，避免瞬移穿透地圖)
            player.x = Math.max(20, Math.min(targetX, canvas.width - player.width - 20));
            player.y = Math.max(20, Math.min(targetY, 585 - player.height));
            
            // 順移後解除攀爬狀態，並重新做平台碰撞檢測
            player.isClimbing = false;
            player.vy = 0;
            player.skillCooldownTimer = this.skillCooldown;
            SoundManager.play('teleport');

            // 產生瞬移藍色魔光粒子
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    player.x + player.width/2 - dx + (Math.random() - 0.5) * 40,
                    player.y + player.height/2 - dy + (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4,
                    "rgba(34, 211, 238, 0.7)",
                    25 + Math.random() * 20
                ));
            }
            return true;
        },
        updateSkill(player) {},
        drawSkill(ctx, player) {}
    },
    shadower: {
        className: "神偷",
        speed: 2.5,
        jumpForce: 9.5,
        attackRange: 200, // 下修穿透距離
        attackCooldown: 500,
        skillCooldown: 60000, // 60秒
        color: "#facc15",
        description: "煙霧彈 (Shift)：施放後畫面暫停，必須在7秒內於下方輸入煙霧彈消失時間 (經過60秒)！",
        initSkill(player) {},
        useSkill(player) {
            isQuizActive = true;
            quizTimer = 7.0;
            const answerTime = globalGameTimer - 60;
            const m = Math.floor(answerTime / 60);
            const s = Math.floor(answerTime % 60);
            expectedQuizAnswer = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            
            const inputEl = document.getElementById("chat-input");
            inputEl.value = "";
            document.getElementById("chat-box-container").style.display = "block";
            setTimeout(() => inputEl.focus(), 50);
            
            player.skillCooldownTimer = this.skillCooldown;
            return true;
        },
        updateSkill(player) {},
        drawSkill(ctx, player) {}
    },
    thief: {
        className: "盜賊",
        speed: 2.5,
        jumpForce: 9.5,
        attackRange: 250,
        attackCooldown: 500,
        skillCooldown: 0, 
        color: "#a78bfa",
        description: "二段跳 (Alt)：空中跳躍時再次按下 Alt 即可朝前滑行大跳躍。",
        initSkill(player) {
            player.hasDoubleJumped = false;
        },
        useSkill(player) {
            // 盜賊位移綁定在跳躍鍵，這裡的 Shift 被觸發時如果符合二段跳條件則發動
            return this.triggerDoubleJump(player);
        },
        triggerDoubleJump(player) {
            if (player.isGrounded || player.isClimbing || player.hasDoubleJumped) return false;
            player.hasDoubleJumped = true;
            player.vy = -6.5; // 給予一定高度
            player.vx = 22 * player.facing; // 猛烈向前噴射 (速度加快)
            SoundManager.play('jump');

            // 產生紫色旋風粒子
            for (let i = 0; i < 12; i++) {
                particles.push(new Particle(
                    player.x + player.width/2,
                    player.y + player.height,
                    -player.facing * (2 + Math.random() * 3),
                    (Math.random() - 0.5) * 3,
                    "rgba(167, 139, 250, 0.7)",
                    20 + Math.random() * 15
                ));
            }
            return true;
        },
        updateSkill(player) {},
        drawSkill(ctx, player) {}
    },
    archer: {
        className: "弓手",
        speed: 2.1,
        jumpForce: 8.5,
        attackRange: 320,
        attackCooldown: 600,
        skillCooldown: 2500,
        color: "#fbbf24",
        description: "後退迴避 (Shift)：向後斜大跳躍 150px，並同時朝前方射出一發貫穿箭。",
        initSkill(player) {},
        useSkill(player) {
            player.isClimbing = false;
            player.vy = -6.0;
            player.vx = -10.5 * player.facing; // 往後飛
            player.skillCooldownTimer = this.skillCooldown;
            SoundManager.play('jump');

            // 朝前方射出一支威力強大的黃金箭
            projectiles.push(new Projectile(
                player.x + player.width/2,
                player.y + player.height/2,
                16 * player.facing,
                0,
                "#fbbf24",
                8,
                true // 穿透
            ));

            return true;
        },
        updateSkill(player) {},
        drawSkill(ctx, player) {}
    },
    pirate: {
        className: "海盜",
        speed: 2.3,
        jumpForce: 9,
        attackRange: 150,
        attackCooldown: 550,
        skillCooldown: 3000,
        color: "#f472b6",
        description: "衝擊滑行 (Shift)：不論地上或空中皆可瞬間朝前方滑行，產生霸體衝撞。",
        initSkill(player) {},
        useSkill(player) {
            player.isClimbing = false;
            player.isSkillDashing = true;
            player.skillDashTicks = 8; // 滑行 8 幀
            player.vy = 0; // 重力暫停
            player.skillCooldownTimer = this.skillCooldown;
            SoundManager.play('dash');
            return true;
        },
        updateSkill(player) {
            if (player.isSkillDashing) {
                player.vx = 17 * player.facing;
                player.vy = 0; // 鎖定 Y 軸
                player.skillDashTicks--;
                if (player.skillDashTicks <= 0) {
                    player.isSkillDashing = false;
                }
            }
        },
        drawSkill(ctx, player) {
            if (player.isSkillDashing) {
                // 粉色雷光殘影
                ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
                ctx.beginPath();
                ctx.arc(player.x + player.width/2 - player.facing * 20, player.y + player.height/2, 25, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
};

// 選角起始設定對應表 (配合真實地圖座標調整)
const StartingSetup = {
    icelightning_1: { job: "mage", x: 135, y: 305, label: "冰雷1" },     // 左上大台
    icelightning_2: { job: "mage", x: 135, y: 485, label: "冰雷2" },     // 左下大台
    hero_1: { job: "warrior", x: 300, y: 585, label: "英雄1" },          // 地面左
    shadower_1: { job: "shadower", x: 800, y: 285, label: "神偷1" },        // 右上大台
    shadower_2: { job: "shadower", x: 835, y: 440, label: "神偷2" },        // 右中大台
    buccaneer: { job: "pirate", x: 200, y: 585, label: "拳霸" },         // 地面極左
    hero_2: { job: "warrior", x: 450, y: 585, label: "英雄2" },          // 地面中左
    darkknight_1: { job: "warrior", x: 550, y: 585, label: "黑騎1" },    // 地面中右
    darkknight_2: { job: "warrior", x: 700, y: 585, label: "黑騎2" },    // 地面右
    marksman: { job: "archer", x: 835, y: 550, label: "神射手" },        // 右下大台
    nightlord: { job: "thief", x: 290, y: 270, label: "夜使者" },        // 左高浮島
    bowmaster: { job: "archer", x: 250, y: 430, label: "箭神" }          // 左低浮島
};

// ==============================================
// 【紅閃天雷位置微調區】 (可以在這裡自由修改 X 座標！)
// ==============================================
const SHOW_DEBUG_LINES = false; // 設為 false 即可隱藏這些紅色的調整輔助線

const RED_LIGHTNING_CONFIG = {
    positions: [
        150,   // 左側第一條
        280,   // 左側第二條
        740,   // 右側第一條
        880    // 右側第二條
    ],
    width: 70  // 每條落雷的寬度
};
// ==============================================

// 地形定義 (精準校正 8 個實體與浮空平台)
const platforms = [
    { name: "底層地面", xMin: 0, xMax: 1024, y: 585, isSolid: true },
    
    // 左側
    { name: "左上大台", xMin: 0, xMax: 248, y: 280, isSolid: false },
    { name: "左下大台", xMin: 0, xMax: 185, y: 410, isSolid: false },
    { name: "左高浮島", xMin: 275, xMax: 320, y: 230, isSolid: false },
    { name: "左高2島", xMin: 338, xMax: 385, y: 190, isSolid: false },
    { name: "左低浮島", xMin: 205, xMax: 250, y: 452, isSolid: false },
    
    // 右側
    { name: "右上大台", xMin: 745, xMax: 925, y: 230, isSolid: false },
    { name: "右中大台", xMin: 805, xMax: 925, y: 410, isSolid: false },
    { name: "右中3島", xMin: 675, xMax: 725, y: 190, isSolid: false },
    { name: "右中4島", xMin: 675, xMax: 725, y: 282, isSolid: false },
    { name: "右中2島", xMin: 740, xMax: 788, y: 450, isSolid: false },
    { name: "右中浮島", xMin: 740, xMax: 788, y: 365, isSolid: false }
];

// 繩索定義 (精準校正 4 條主副繩索)
const ropes = [
    { x: 140, yMin: 405, yMax: 570, label: "左主繩索" },
    { x: 107, yMin: 270, yMax: 415, label: "左懸空繩索" },
    { x: 762, yMin: 235, yMax: 345, label: "右上懸空繩" },
    { x: 858, yMin: 415, yMax: 570, label: "右下主繩索" }
];

// ==========================================
// 核心 Class 定義
// ==========================================

// 粒子特效類別
class Particle {
    constructor(x, y, vx, vy, color, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = maxLife;
        this.maxLife = maxLife;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3 * (this.life / this.maxLife) + 1, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

// 投射物類別 (飛鏢、箭矢)
class Projectile {
    constructor(x, y, vx, vy, color, size, pierce = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.pierce = pierce;
        this.active = true;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        // 飛出畫面外自動消失
        if (this.x < -100 || this.x > 1124) this.active = false;
    }
    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        if (this.pierce) { // 繪製箭矢
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - Math.sign(this.vx) * 20, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();
        } else { // 繪製旋轉飛鏢
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// 飄浮傷害數字類別 (還原楓之谷風格)
class DamageNumber {
    constructor(text, x, y, isCrit = false, isPlayer = false) {
        this.text = text.toString();
        this.x = x + (Math.random() - 0.5) * 15;
        this.y = y - Math.random() * 10;
        this.vy = -1.8;
        this.life = 45; // 幀數
        this.isCrit = isCrit;
        this.isPlayer = isPlayer;
    }
    update() {
        this.x += (Math.random() - 0.5) * 0.5;
        this.y += this.vy;
        this.vy *= 0.95; // 逐漸減速上升
        this.life--;
    }
    draw(ctx) {
        ctx.save();
        ctx.font = this.isCrit ? "italic 900 24px 'Orbitron'" : "italic 900 20px 'Orbitron'";
        ctx.textAlign = "center";
        ctx.globalAlpha = this.life / 45;

        // 漸層色設計
        let fillGrad = ctx.createLinearGradient(this.x, this.y - 12, this.x, this.y + 8);
        if (this.isPlayer) {
            // 玩家受傷：紫紅色
            fillGrad.addColorStop(0, "#ff4b4b");
            fillGrad.addColorStop(1, "#990000");
        } else if (this.isCrit) {
            // 爆擊：橘黃漸層
            fillGrad.addColorStop(0, "#fef08a");
            fillGrad.addColorStop(0.5, "#f97316");
            fillGrad.addColorStop(1, "#b45309");
        } else {
            // 一般攻擊：粉紫漸層
            fillGrad.addColorStop(0, "#f472b6");
            fillGrad.addColorStop(1, "#db2777");
        }

        // 描邊效果
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 5;
        ctx.strokeText(this.text, this.x, this.y);

        ctx.fillStyle = fillGrad;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// 玩家角色類別
class Player {
    constructor(selectedId) {
        const setup = StartingSetup[selectedId];
        this.jobType = setup.job;
        this.config = JobConfigs[this.jobType];
        
        this.x = setup.x;
        this.y = setup.y;
        this.width = 24;
        this.height = 36;
        
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = 右, -1 = 左
        
        this.isGrounded = false;
        this.isClimbing = false;
        this.climbingRope = null;
        this.maxHp = this.jobType === 'mage' ? 2 : 3; // 法師改為 2 條命
        this.hp = this.maxHp; 
        this.dpsHits = 0;
        this.invulnerableTicks = 0; // 無敵幀
        this.lightningBuff = 0; // 竹筍白雷段數
        
        // 攻擊與技能冷卻
        this.attackCooldownTimer = 0;
        this.attackStiffTimer = 0; // 攻擊僵直時間
        this.skillCooldownTimer = 0;
        
        // 平台單向穿透標記
        this.downJumpTicks = 0;
        this.ignoreCollisionPlatform = null;

        // 突進與滑行特殊變數
        this.isSkillDashing = false;
        this.skillDashTicks = 0;

        // 初始化職業專屬屬性
        this.config.initSkill(this);
    }

    update() {
        // 處理無敵閃爍時間
        if (this.invulnerableTicks > 0) this.invulnerableTicks--;
        
        // 處理 CD 與 僵直
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= 16.67;
        if (this.attackStiffTimer > 0) {
            this.attackStiffTimer -= 16.67;
            if (this.attackStiffTimer < 0) this.attackStiffTimer = 0;
        }
        if (this.skillCooldownTimer > 0) {
            this.skillCooldownTimer -= 16.67;
            if (this.skillCooldownTimer < 0) this.skillCooldownTimer = 0;
        }

        // 更新 CD UI
        const cdPercent = Math.max(0, (this.skillCooldownTimer / this.config.skillCooldown) * 100);
        const cdBar = document.getElementById('cd-bar');
        const cdText = document.getElementById('cd-text');
        if (cdBar && cdText) {
            cdBar.style.width = `${100 - cdPercent}%`;
            if (this.skillCooldownTimer > 0) {
                cdBar.classList.add('cooling');
                cdText.textContent = `${(this.skillCooldownTimer / 1000).toFixed(1)}s`;
            } else {
                cdBar.classList.remove('cooling');
                cdText.textContent = "READY";
            }
        }

        // 穿透平台的忽略時間
        if (this.downJumpTicks > 0) {
            this.downJumpTicks--;
            if (this.downJumpTicks === 0) {
                this.ignoreCollisionPlatform = null;
            }
        }

        // 1. 爬繩狀態下的物理
        if (this.isClimbing) {
            this.vx = 0;
            this.vy = 0;
            
            if (keys['ArrowUp'] || keys['w']) {
                this.vy = -2.5;
            } else if (keys['ArrowDown'] || keys['s']) {
                this.vy = 2.5;
            }

            this.y += this.vy;

            // 爬繩邊界判定
            if (this.y < this.climbingRope.yMin - 20) { // 爬到頂
                this.y = this.climbingRope.yMin - this.height;
                this.isClimbing = false;
                this.isGrounded = true;
                this.vy = 0;
            } else if (this.y + this.height > this.climbingRope.yMax) { // 爬到底落地
                this.y = this.climbingRope.yMax - this.height; // 精準踩在地板上
                this.isClimbing = false;
                this.isGrounded = true;
                this.vy = 0;
            }

            // 在爬繩上按下 Alt 鍵可以左右跳離
            if (keys['Alt'] || keys['alt']) {
                keys['Alt'] = false; // 消耗跳躍
                keys['alt'] = false;
                this.isClimbing = false;
                this.vy = -6.5;
                if (keys['ArrowLeft'] || keys['a']) {
                    this.vx = -4.5;
                    this.facing = -1;
                } else if (keys['ArrowRight'] || keys['d']) {
                    this.vx = 4.5;
                    this.facing = 1;
                } else {
                    this.vx = 0;
                }
                SoundManager.play('jump');
            }
            return; // 爬繩中略過地表重力計算
        }

        // 2. 一般狀態物理計算
        // 處理水平移動 (受僵直影響)
        if (!this.isSkillDashing && this.attackStiffTimer <= 0) {
            if (keys['ArrowLeft'] || keys['a']) {
                this.vx = -this.config.speed;
                this.facing = -1;
            } else if (keys['ArrowRight'] || keys['d']) {
                this.vx = this.config.speed;
                this.facing = 1;
            } else {
                this.vx = 0;
            }
        } else if (this.attackStiffTimer > 0) {
            this.vx = 0; // 僵直時無法移動
        }

        // 應用職業特殊的突進/滑行物理
        this.config.updateSkill(this);

        // 重力
        if (!this.isGrounded) {
            this.vy += 0.45; // 重力加速度
            if (this.vy > 12) this.vy = 12; // 終端速度
        }

        // 座標更新
        this.x += this.vx;
        this.y += this.vy;

        // 邊界碰撞限制
        if (this.x < 0) { this.x = 0; this.vx = 0; }
        if (this.x > canvas.width - this.width) { this.x = canvas.width - this.width; this.vx = 0; }

        // 檢測是否與繩索重疊 (若按下 UP / DOWN 則進入爬繩)
        this.checkRopeTrigger();

        // 平台碰撞檢測
        this.checkPlatformCollision();
    }

    checkRopeTrigger() {
        for (let rope of ropes) {
            // 當水平距離在繩子 12px 內，且垂直範圍在繩索區間內
            if (Math.abs(this.x + this.width/2 - rope.x) < 14) {
                if (this.y + this.height > rope.yMin && this.y < rope.yMax) {
                    if (keys['ArrowUp'] || keys['w'] || (keys['ArrowDown'] || keys['s'])) {
                        // 鎖定到繩子中心，進入爬繩
                        this.x = rope.x - this.width/2;
                        this.isClimbing = true;
                        this.climbingRope = rope;
                        this.isGrounded = false;
                        this.vx = 0;
                        this.vy = 0;
                        break;
                    }
                }
            }
        }
    }

    checkPlatformCollision() {
        // 如果垂直往下，做平台判定
        if (this.vy >= 0) {
            let previouslyGrounded = this.isGrounded;
            this.isGrounded = false;
            
            for (let plat of platforms) {
                // 如果是需要忽略的平台 (下跳時)
                if (plat === this.ignoreCollisionPlatform) continue;

                // 檢查 X 區間
                if (this.x + this.width > plat.xMin && this.x < plat.xMax) {
                    // 檢查 Y 座標 (腳底剛好踏在平台上，容許誤差 6px)
                    if (this.y + this.height >= plat.y && this.y + this.height <= plat.y + this.vy + 6) {
                        this.y = plat.y - this.height;
                        this.vy = 0;
                        this.isGrounded = true;
                        this.hasDoubleJumped = false; // 落地重置二段跳
                        break;
                    }
                }
            }
        } else {
            this.isGrounded = false;
        }
    }

    jump() {
        if (this.isClimbing || this.attackStiffTimer > 0) return;

        // 處理下跳 (↓ + Alt)
        if (this.isGrounded && (keys['ArrowDown'] || keys['s'])) {
            // 找出目前站在哪個平台上
            let currentPlat = null;
            for (let plat of platforms) {
                if (this.x + this.width > plat.xMin && this.x < plat.xMax) {
                    if (Math.abs(this.y + this.height - plat.y) < 3) {
                        currentPlat = plat;
                        break;
                    }
                }
            }
            // 若為非底層地面，則可以下跳
            if (currentPlat && !currentPlat.isSolid) {
                this.ignoreCollisionPlatform = currentPlat;
                this.downJumpTicks = 20; // 忽略碰撞 20 幀
                this.isGrounded = false;
                this.vy = 2.5; // 給予往下掉的初速
                this.y += 5;   // 立刻挪移 5px 脫離接觸
                SoundManager.play('jump');
                return;
            }
        }

        // 一般跳躍
        if (this.isGrounded) {
            this.vy = -this.config.jumpForce;
            this.isGrounded = false;
            SoundManager.play('jump');
        } else {
            // 盜賊空中二段跳
            if (this.jobType === 'thief') {
                this.config.triggerDoubleJump(this);
            }
        }
    }

    attack() {
        // 空中禁止按攻擊鍵、爬繩禁止攻擊、冷卻中禁止攻擊
        if (this.isClimbing || !this.isGrounded || this.attackCooldownTimer > 0) return;
        
        this.attackCooldownTimer = this.config.attackCooldown;
        // 攻擊僵直時間拉長：等於攻擊冷卻時間 100% (原本是 80%)
        this.attackStiffTimer = this.config.attackCooldown;
        SoundManager.play('attack');

        const facingOffset = this.facing === 1 ? this.width : 0;
        
        // 根據職業生成不同的打擊區域或投射物
        if (this.jobType === 'warrior') { // 劍士/黑騎：前方弧形揮砍
            // 建立近戰打擊範圍
            const hitArea = {
                x: this.facing === 1 ? this.x + this.width : this.x - this.config.attackRange,
                y: this.y - 12,
                width: this.config.attackRange,
                height: this.height + 24
            };

            // 繪製揮砍光弧粒子
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    hitArea.x + Math.random() * hitArea.width,
                    hitArea.y + Math.random() * hitArea.height,
                    this.facing * (1 + Math.random() * 2),
                    (Math.random() - 0.5) * 2,
                    "rgba(254, 240, 138, 0.7)",
                    15
                ));
            }

            // 判定是否打到龍王頭部
            bossHeads.forEach(head => {
                if (checkOverlap(hitArea, head)) {
                    for (let n = 0; n < 1 + this.lightningBuff; n++) {
                        damageBoss(head);
                    }
                }
            });

        } else if (this.jobType === 'shadower') { // 神偷：躲距離穿透，兩次傷害
            const hitArea = {
                x: this.facing === 1 ? this.x + this.width : this.x - this.config.attackRange,
                y: this.y + this.height/2 - 20,
                width: this.config.attackRange,
                height: 40
            };

            // 繪製穿透光束/氣流
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(
                    hitArea.x + Math.random() * hitArea.width,
                    hitArea.y + Math.random() * hitArea.height,
                    this.facing * (4 + Math.random() * 6),
                    (Math.random() - 0.5) * 2,
                    "rgba(250, 204, 21, 0.8)",
                    20
                ));
            }

            bossHeads.forEach(head => {
                if (checkOverlap(hitArea, head)) {
                    for (let n = 0; n < 1 + this.lightningBuff; n++) {
                        damageBoss(head);
                    }
                }
            });

        } else if (this.jobType === 'thief') { // 盜賊/夜使者：水平飛鏢
            for (let n = 0; n < 1 + this.lightningBuff; n++) {
                projectiles.push(new Projectile(
                    this.x + facingOffset - n * 15 * this.facing,
                    this.y + this.height/2 - n * 5,
                    14 * this.facing,
                    0,
                    "#a78bfa",
                    6
                ));
            }
        } else if (this.jobType === 'mage') { // 法師/冰雷：落雷術
            const hitArea = {
                x: this.facing === 1 ? this.x + this.width : this.x - this.config.attackRange,
                y: this.y - 60,
                width: this.config.attackRange,
                height: this.height + 120
            };

            // 繪製落雷閃電絲粒子
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    hitArea.x + Math.random() * hitArea.width,
                    this.y - 60 + Math.random() * 120,
                    0,
                    3 + Math.random() * 3,
                    "rgba(34, 211, 238, 0.8)",
                    20
                ));
            }

            bossHeads.forEach(head => {
                if (checkOverlap(hitArea, head)) {
                    for (let n = 0; n < 1 + this.lightningBuff; n++) {
                        damageBoss(head);
                    }
                }
            });
        } else if (this.jobType === 'archer') { // 弓手/箭神：疾風箭
            for (let n = 0; n < 1 + this.lightningBuff; n++) {
                projectiles.push(new Projectile(
                    this.x + facingOffset - n * 15 * this.facing,
                    this.y + this.height/2,
                    15 * this.facing,
                    0,
                    "#fbbf24",
                    5
                ));
            }
        } else if (this.jobType === 'pirate') { // 海盜/拳霸：寸勁拳
            const hitArea = {
                x: this.facing === 1 ? this.x + this.width : this.x - this.config.attackRange,
                y: this.y - 5,
                width: this.config.attackRange,
                height: this.height + 10
            };

            // 爆破粉色電氣
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(
                    hitArea.x + Math.random() * hitArea.width,
                    hitArea.y + Math.random() * hitArea.height,
                    this.facing * (2 + Math.random() * 2),
                    (Math.random() - 0.5) * 3,
                    "rgba(244, 114, 182, 0.7)",
                    18
                ));
            }

            bossHeads.forEach(head => {
                if (checkOverlap(hitArea, head)) {
                    for (let n = 0; n < 1 + this.lightningBuff; n++) {
                        damageBoss(head);
                    }
                }
            });
        }
    }

    useSkill() {
        if (this.skillCooldownTimer > 0) return;
        this.config.useSkill(this);
    }

    draw(ctx) {
        // 如果玩家自己準備了 player.gif，則顯示圖片並隱藏原本的 Canvas 積木小人
        const gifImg = document.getElementById("player-gif");
        if (gifImg && window.playerGifLoaded) {
            if (this.isDead) {
                gifImg.style.display = "none";
                return;
            }
            
            // 處理無敵閃爍
            if (this.invulnerableTicks > 0 && Math.floor(this.invulnerableTicks / 5) % 2 === 0) {
                gifImg.style.opacity = "0.3";
            } else {
                gifImg.style.opacity = "1";
            }
            
            // 計算 Canvas 實際渲染的縮放比例
            const scaleX = canvas.clientWidth / 1024;
            const scaleY = canvas.clientHeight / 680;
            
            // ==============================================
            // 【玩家 GIF 顯示微調區】 
            // 如果玩家圖片大小不對或偏離中心，可以修改下方數字
            // ==============================================
            const pOffsetX = 0;
            const pOffsetY = -10; // 稍微往上提一點點
            const pExpandW = 20;  // 預設寬度稍微加大
            const pExpandH = 20;  // 預設高度稍微加大
            
            // 如果您準備的 GIF 原始圖片是「面朝左邊」的，請將這裡設定為 true
            // 如果原始圖片是「面朝右邊」，則設定為 false
            const isGifFacingLeft = true; 
            // ==============================================
            
            gifImg.style.display = "block";
            gifImg.style.left = ((this.x + pOffsetX - pExpandW/2) * scaleX) + "px";
            gifImg.style.top = ((this.y + pOffsetY - pExpandH/2) * scaleY) + "px";
            gifImg.style.width = ((this.width + pExpandW) * scaleX) + "px";
            gifImg.style.height = ((this.height + pExpandH) * scaleY) + "px";
            
            // 根據玩家面朝方向翻轉圖片
            if (this.facing === 1) { // 往右走
                gifImg.style.transform = isGifFacingLeft ? "scaleX(-1)" : "scaleX(1)";
            } else { // 往左走
                gifImg.style.transform = isGifFacingLeft ? "scaleX(1)" : "scaleX(-1)";
            }
            
            // 已經用 DOM 畫圖了，直接 return 不畫原本的方塊
            return;
        } else if (gifImg) {
            gifImg.style.display = "none";
        }

        ctx.save();
        
        // 處理無敵時間的閃爍
        if (this.invulnerableTicks > 0 && Math.floor(this.invulnerableTicks / 5) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        // 1. 繪製身體 (楓之谷紙娃娃風格卡通方體)
        ctx.fillStyle = this.config.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.config.color;
        
        // 四角圓弧的主體
        drawRoundRect(ctx, this.x, this.y, this.width, this.height, 6);
        ctx.fill();

        // 2. 繪製眼睛 (朝著面朝方向)
        ctx.fillStyle = "#ffffff";
        const eyeOffset = this.facing === 1 ? 14 : 4;
        ctx.fillRect(this.x + eyeOffset, this.y + 8, 6, 6);
        ctx.fillStyle = "#000000";
        const pupilOffset = this.facing === 1 ? 17 : 4;
        ctx.fillRect(this.x + pupilOffset, this.y + 8, 3, 6);

        // 3. 繪製手部裝備/特色武器
        ctx.fillStyle = "#cbd5e1";
        const handX = this.facing === 1 ? this.x + this.width - 4 : this.x - 2;
        ctx.fillRect(handX, this.y + 18, 6, 6);

        // 繪製不同職業外觀特徵
        if (this.jobType === 'warrior') { // 戰士巨盾
            ctx.fillStyle = "#dc2626";
            const shieldX = this.facing === 1 ? this.x - 4 : this.x + this.width - 2;
            ctx.fillRect(shieldX, this.y + 12, 6, 16);
        } else if (this.jobType === 'mage') { // 法師發光皇冠
            ctx.fillStyle = "#22d3ee";
            ctx.beginPath();
            ctx.moveTo(this.x + 2, this.y - 1);
            ctx.lineTo(this.x + 6, this.y - 6);
            ctx.lineTo(this.x + 12, this.y - 1);
            ctx.lineTo(this.x + 18, this.y - 6);
            ctx.lineTo(this.x + 22, this.y - 1);
            ctx.closePath();
            ctx.fill();
        } else if (this.jobType === 'thief') { // 盜賊面紗
            ctx.fillStyle = "#1e1b4b";
            ctx.fillRect(this.x + (this.facing === 1 ? 8 : 0), this.y + 14, 16, 10);
        } else if (this.jobType === 'archer') { // 弓手羽毛帽
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width/2 - this.facing * 10, this.y - 8);
            ctx.lineTo(this.x + this.width/2 - this.facing * 4, this.y);
            ctx.closePath();
            ctx.fill();
        }

        // 4. 繪製爬繩攀爬動作
        if (this.isClimbing) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillRect(this.x - 4, this.y + 6, 4, 8);
            ctx.fillRect(this.x + this.width, this.y + 6, 4, 8);
        }

        // 5. 職業位移殘影繪製
        this.config.drawSkill(ctx, this);

        ctx.restore();
    }

    takeDamage(reason) {
        if (this.invulnerableTicks > 0) return;
        
        // 檢查是否在神偷的煙霧彈結界內
        if (activeSmokescreen) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height; // 腳底
            if (cx >= activeSmokescreen.x && cx <= activeSmokescreen.x + activeSmokescreen.width &&
                cy >= activeSmokescreen.y && cy <= activeSmokescreen.y + activeSmokescreen.height) {
                return; // 煙霧彈結界內無敵
            }
        }
        
        if (isGameOver) return;
        
        this.hp--;
        this.invulnerableTicks = 90; // 1.5 秒無敵
        SoundManager.play('hurt');
        screenShake = 15; // 震動幅度

        // 飄出受傷紅字
        const hurtDmg = Math.floor(6000 + Math.random() * 3000);
        damageNumbers.push(new DamageNumber(hurtDmg, this.x + this.width/2, this.y, false, true));

        // 更新生命 HUD
        updateHeartsUI(this.hp);

        // 受傷噴紅血粒子
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(
                this.x + this.width/2,
                this.y + this.height/2,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                "rgba(239, 68, 68, 0.8)",
                30
            ));
        }

        if (this.hp <= 0) {
            triggerGameOver(false, reason);
        }
    }
}

// 龍王頭部部位類別 (不寫死，未來可新增其他部位)
class BossPart {
    constructor(id, name, x, y, radius, hoverPlat) {
        this.id = id;
        this.name = name;
        this.x = x;
        // 將 hitbox 往上拉高 120px，讓站在平台上的玩家也能打到下方的頭
        this.y = y - 120; 
        this.drawY = y; // 保留原始 Y 用於視覺繪圖
        this.width = radius * 2; // 供 Overlap 箱碰撞用
        this.height = radius * 2 + 120; // 判定高度跟著加長
        this.radius = radius;
        this.hoverPlat = hoverPlat; // 關聯哪一個平台 (鎖鍊警示會影響這部分)
        this.hurtFlashTicks = 0;
    }
    update() {
        if (this.hurtFlashTicks > 0) this.hurtFlashTicks--;
    }
    draw(ctx) {
        ctx.save();
        
        // 如果被擊中，頭部會短暫閃白
        if (this.hurtFlashTicks > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = "rgba(31, 41, 55, 0.95)";
            ctx.shadowColor = "rgba(239, 68, 68, 0.3)";
            ctx.shadowBlur = 15;
        }

        // 1. 繪製龍王龍鱗頭殼外框
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.drawY + this.radius, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 2. 繪製尖銳的魔角
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        // 角1
        ctx.moveTo(this.x + this.radius - 15, this.drawY + 10);
        ctx.quadraticCurveTo(this.x + this.radius - 35, this.drawY - 30, this.x + this.radius - 20, this.drawY - 45);
        ctx.quadraticCurveTo(this.x + this.radius - 10, this.drawY - 20, this.x + this.radius - 5, this.drawY + 5);
        ctx.fill();
        // 角2
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius + 15, this.drawY + 10);
        ctx.quadraticCurveTo(this.x + this.radius + 35, this.drawY - 30, this.x + this.radius + 20, this.drawY - 45);
        ctx.quadraticCurveTo(this.x + this.radius + 10, this.drawY - 20, this.x + this.radius + 5, this.drawY + 5);
        ctx.fill();

        // 3. 繪製巨龍眼睛 (平時橘色，紅咬發動時劇烈閃爍紅光)
        if (redBiteWarningActive) {
            ctx.fillStyle = (Math.floor(Date.now() / 80) % 2 === 0) ? "#ff0000" : "#ffffff";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = "#f59e0b";
        }
        ctx.fillRect(this.x + this.radius - 16, this.drawY + this.radius - 8, 8, 6);
        ctx.fillRect(this.x + this.radius + 8, this.drawY + this.radius - 8, 8, 6);

        // 4. 繪製呼吸動畫效果 (些微伸縮)
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.drawY + this.radius + 10, 8, 0, Math.PI, false);
        ctx.fill();

        // 5. 繪製名字標籤
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(this.x, this.drawY + this.radius * 2 + 5, this.radius * 2, 18);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.strokeRect(this.x, this.drawY + this.radius * 2 + 5, this.radius * 2, 18);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + this.radius, this.drawY + this.radius * 2 + 17);

        ctx.restore();
    }
}

// ==========================================
// 全域狀態定義與初始化
// ==========================================

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let keys = {};
let particles = [];
let projectiles = [];
let damageNumbers = [];
let player = null;
let bossHeads = [];

// 特訓核心數據
let dpsHits = 0;
const dpsTarget = 15; // 特訓目標次數
let survivalTime = 0.0;
let lastTime = 0;

let isGameRunning = false;
let isGameOver = false;
let deathAnimTime = 0; // 死亡視角動畫時間
let screenShake = 0;
let animationFrameId = null; // 追蹤 gameLoop 的 ID 以避免重複執行

// 地圖背景圖片載入
let bgImage = new Image();
bgImage.src = 'bg.png';
let bgImageLoaded = false;
bgImage.onload = () => { bgImageLoaded = true; };

// 技能預警相關
let redBiteTimer = 6.0; // 每 6 秒
let redBiteWarningActive = false;
let redBiteTargetRect = null; // 記錄紅咬鎖定的目標區域 {x, y, width, height}

let redLightningTimer = 13.0; // 每 13-16 秒
let redLightningWarningActive = false;
let redLightningXRanges = []; 

let blackChainTimer = 15.0; // 每 15 秒
let blackChainWarningActive = false;
let blackChainTargetPlat = null;
let blackChainParticles = [];

let fireBreathTimer = 10.0; // 大噴火 每 10 秒
let fireBreathWarningActive = false;

// 煙霧彈與全局倒數
let globalGameTimer = 1800.0; // 30 分鐘
let isQuizActive = false;
let quizTimer = 0.0;
let expectedQuizAnswer = "";

// 法師魔心防禦消除
let mageDispelTimer = -1.0;
let isMageDispelActive = false;

// 竹筍白雷機制
let bamboos = [];
let bambooSpawnTimer = 10.0;
let activeSmokescreen = null; // 神偷煙霧彈結界

// ==========================================
// 鍵盤事件監聽
// ==========================================

// 防止切換視窗時按鍵卡住 (角色一直走)
window.addEventListener('blur', () => {
    for (let k in keys) {
        keys[k] = false;
    }
});

window.addEventListener('keydown', (e) => {
    // 煙霧彈期間，鎖定大部分按鍵，避免干擾聊天輸入
    if (isQuizActive && e.target.id === 'chat-input') {
        return;
    }

    // 阻擋方向鍵與空白鍵的網頁滾動行為
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Alt"].includes(e.key)) {
        e.preventDefault();
    }
    
    // Q鍵 魔心防禦
    if ((e.key === 'q' || e.key === 'Q') && !keys['q']) {
        keys['q'] = true;
        if (player && isGameRunning && !isGameOver && !isQuizActive && player.jobType === 'mage') {
            if (isMageDispelActive) {
                isMageDispelActive = false;
                mageDispelTimer = 5.0 + Math.random() * 5.0; // 重置下次發動時間
                hideDispelAlertBanner();
                SoundManager.play('click');
                triggerDispelAlertBanner("✨ 魔心防禦已重新啟動！");
                setTimeout(hideDispelAlertBanner, 1500);
            }
        }
    }

    // Alt 跳躍
    if (e.key === 'Alt' && !keys['Alt']) {
        keys['Alt'] = true;
        if (player && isGameRunning && !isGameOver) {
            player.jump();
        }
    }
    
    // Shift 位移技能
    if (e.key === 'Shift' && !keys['Shift']) {
        keys['Shift'] = true;
        if (player && isGameRunning && !isGameOver) {
            player.useSkill();
        }
    }

    // Ctrl 攻擊
    if (e.key === 'Control' || e.key === 'Ctrl') {
        keys['Ctrl'] = true;
        if (player && isGameRunning && !isGameOver) {
            player.attack();
        }
    }

    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'Alt') keys['Alt'] = false;
    if (e.key === 'Shift') keys['Shift'] = false;
    if (e.key === 'Control' || e.key === 'Ctrl') keys['Ctrl'] = false;
    if (e.key === 'q' || e.key === 'Q') keys['q'] = false;
});

// ==========================================
// 手機版虛擬按鈕事件監聽
// ==========================================
function bindTouchButton(btnId, keyName, actionFn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    const handleStart = (e) => {
        e.preventDefault();
        btn.classList.add('active');
        keys[keyName] = true;
        if (actionFn && player && isGameRunning && !isGameOver) {
            actionFn();
        }
    };
    
    const handleEnd = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        keys[keyName] = false;
    };

    btn.addEventListener('touchstart', handleStart, { passive: false });
    btn.addEventListener('touchend', handleEnd, { passive: false });
    btn.addEventListener('touchcancel', handleEnd, { passive: false });
}

// 在頁面載入後綁定，避免元素尚未產生
window.addEventListener('load', () => {
    // 綁定方向鍵
    bindTouchButton('btn-up', 'ArrowUp');
    bindTouchButton('btn-down', 'ArrowDown');
    bindTouchButton('btn-left', 'ArrowLeft');
    bindTouchButton('btn-right', 'ArrowRight');

    // 綁定動作鍵
    bindTouchButton('btn-alt', 'Alt', () => player.jump());
    bindTouchButton('btn-shift', 'Shift', () => player.useSkill());
    bindTouchButton('btn-ctrl', 'Ctrl', () => player.attack());
    bindTouchButton('btn-q', 'q', () => {
        if (player && player.jobType === 'mage' && isMageDispelActive) {
            isMageDispelActive = false;
            mageDispelTimer = 5.0 + Math.random() * 5.0;
            hideDispelAlertBanner();
            SoundManager.play('click');
            triggerDispelAlertBanner("✨ 魔心防禦已重新啟動！");
            setTimeout(hideDispelAlertBanner, 1500);
        }
    });
});

// ==========================================
// 地圖選角交互入口
// ==========================================

let selectedSetupId = null;

function selectChar(setupId) {
    SoundManager.play('click');
    const nameInput = document.getElementById("player-name");
    let playerName = nameInput.value.trim();
    if (!playerName) {
        alert("請輸入您的特務代號才能開始特訓！");
        nameInput.focus();
        return; // 強制不可進入
    }

    selectedSetupId = setupId;
    
    // 進入遊戲畫面
    document.getElementById("setup-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");

    // 初始化玩家與實體
    initGame(playerName, setupId);
}

// ==========================================
// 遊戲核心流程控制
// ==========================================

function initGame(playerName, setupId) {
    // 初始化全域實體與數據
    particles = [];
    projectiles = [];
    damageNumbers = [];
    dpsHits = 0;
    survivalTime = 0.0;
    isGameRunning = true;
    deathAnimTime = 0; 
    isGameOver = false;
    screenShake = 0;

    // 龍王技能重置
    redBiteTimer = 6.0;
    redBiteWarningActive = false;
    redBiteTargetRect = null;
    
    redLightningTimer = 12.0 + Math.random() * 3.0;
    redLightningWarningActive = false;
    
    blackChainTimer = 15.0;
    blackChainWarningActive = false;

    fireBreathTimer = 10.0;
    fireBreathWarningActive = false;

    globalGameTimer = 1800.0;
    isQuizActive = false;
    isMageDispelActive = false;
    mageDispelTimer = 5.0 + Math.random() * 5.0; // 改為 5~10 秒後首次發動
    document.getElementById("chat-box-container").style.display = "none";
    hideAlertBanner();
    hideDispelAlertBanner();

    bamboos = [];
    bambooSpawnTimer = 10.0;
    activeSmokescreen = null;
    const bambooEl = document.getElementById("bamboo-count");
    if (bambooEl) bambooEl.textContent = "0 / 3";

    // 建立玩家角色
    player = new Player(setupId);

    // 建立 7 個龍王打擊部位 (完全對齊圖片比例)
    bossHeads = [
        new BossPart("head_left", "龍王左頭", 370, 410, 45, "左側"),
        new BossPart("head_mid", "龍王中頭", 512, 280, 50, "中央"),
        new BossPart("head_right", "龍王右頭", 650, 410, 45, "右側"),
        new BossPart("body", "巨龍胸腹", 512, 500, 80, "中央"),
        new BossPart("hand_left", "龍王左手", 380, 500, 35, "左側"),
        new BossPart("hand_right", "龍王右手", 640, 500, 35, "右側"),
        new BossPart("tail", "龍王尾巴", 670, 550, 45, "右側")
    ];

    // 更新 HUD 文字
    document.getElementById("hud-name").textContent = playerName;
    const jobBadge = document.getElementById("hud-job-icon");
    const jobLabel = document.getElementById("hud-class");
    
    jobLabel.textContent = player.config.className;
    jobBadge.className = `job-badge bg-${player.jobType}`;
    
    // 設定 icon HTML
    let iconHTML = '<i class="fas fa-shield-halved"></i>';
    if (player.jobType === 'mage') iconHTML = '<i class="fas fa-wand-magic-sparkles"></i>';
    else if (player.jobType === 'thief') iconHTML = '<i class="fas fa-mask"></i>';
    else if (player.jobType === 'archer') iconHTML = '<i class="fas fa-crosshairs"></i>';
    else if (player.jobType === 'pirate') iconHTML = '<i class="fas fa-hand-fist"></i>';
    jobBadge.innerHTML = iconHTML;

    // 更新生命
    updateHeartsUI(player.hp);
    // 更新打擊進度條
    updateDpsBar(0);

    // 啟動主循環
    isGameRunning = true;
    lastTime = performance.now();
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 退出特訓
function exitGame() {
    isGameRunning = false;
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("setup-screen").classList.add("active");
    loadLeaderboard(); // 刷新排行榜
}

// 重新開始
function restartGame() {
    closeResultModal();
    if (selectedSetupId) {
        selectChar(selectedSetupId);
    }
}

// 關閉結果視窗並返回選角
function closeResultModal() {
    document.getElementById("result-modal").classList.remove("active");
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("setup-screen").classList.add("active");
    isGameRunning = false;
}

// ==========================================
// 碰撞偵測與核心打擊處理
// ==========================================

function checkOverlap(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 玩家擊中龍王
function damageBoss(head) {
    head.hurtFlashTicks = 8; // 閃爍 8 幀
    dpsHits++;
    SoundManager.play('hit');

    // 飄出 Maplestory 橘黃漸層數字 (爆擊機率 35%)
    const isCrit = Math.random() < 0.35;
    const damageVal = isCrit ? Math.floor(180000 + Math.random() * 50000) : Math.floor(70000 + Math.random() * 30000);
    damageNumbers.push(new DamageNumber(damageVal, head.x + head.radius, head.y - 10, isCrit, false));

    // 生成四散擊中碎花粒子
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(
            head.x + head.radius + (Math.random() - 0.5) * 30,
            head.y + head.radius + (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            isCrit ? "rgba(251, 191, 36, 0.8)" : "rgba(244, 114, 182, 0.8)",
            15
        ));
    }

    updateDpsBar(dpsHits);
}

// ==========================================
// 龍王技能 AI 管理
// ==========================================

function updateBossSkills(dt) {
    if (isGameOver) return;

    // ------------------------------------------
    // 1. 紅咬 AI (定點紅牙警告，延遲1.5秒咬合)
    // ------------------------------------------
    redBiteTimer -= dt;
    if (redBiteTimer <= 1.5 && !redBiteWarningActive) {
        redBiteWarningActive = true;
        SoundManager.play('warning');
        
        // 抓取玩家當下位置作為攻擊目標
        redBiteTargetRect = {
            x: player.x - 30,
            y: player.y - 40,
            width: player.width + 60,
            height: player.height + 80
        };
        
        triggerAlertBanner("⚠️ 紅咬鎖定！迅速離開紅色危險區或起跳！");
        
        // 顯示真實版 GIF 動畫
        const gifImg = document.getElementById("red-bite-gif");
        if (gifImg) {
            // 強制 GIF 從第一幀重新播放
            gifImg.src = "red_bite.gif.gif?t=" + new Date().getTime();
            gifImg.style.display = "block";
            
            // 由於網頁縮放，必須計算邏輯座標(1024x680)與實際畫布尺寸的比例
            const scaleX = canvas.clientWidth / 1024;
            const scaleY = canvas.clientHeight / 680;
            
            // ==============================================
            // 【GIF 顯示微調區】 
            // 如果圖片本身的牙齒不在正中間，或者圖片被擠壓變形，請修改下方的數字！
            // ==============================================
            const offsetX = 0;    // 左右偏移 (正數往右，負數往左，例如 -50)
            const offsetY = -20;  // 上下偏移 (正數往下，負數往上)
            const expandW = 100;  // 寬度額外放大 (例如原本是 0，改 100 就會變寬)
            const expandH = 100;  // 高度額外放大 (如果圖片變太扁，把這裡調大)
            // ==============================================
            
            gifImg.style.left = ((redBiteTargetRect.x + offsetX - expandW/2) * scaleX) + "px";
            gifImg.style.top = ((redBiteTargetRect.y + offsetY - expandH/2) * scaleY) + "px";
            gifImg.style.width = ((redBiteTargetRect.width + expandW) * scaleX) + "px";
            gifImg.style.height = ((redBiteTargetRect.height + expandH) * scaleY) + "px";
        }
    }

    if (redBiteTimer <= 0) {
        // 發動紅咬傷害判定
        redBiteWarningActive = false;
        redBiteTimer = 6.0; // 重置
        hideAlertBanner();
        
        // 隱藏 GIF
        const gifImg = document.getElementById("red-bite-gif");
        if (gifImg) {
            gifImg.style.display = "none";
        }

        // 咬合特效
        if (redBiteTargetRect) {
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    redBiteTargetRect.x + Math.random() * redBiteTargetRect.width,
                    redBiteTargetRect.y + Math.random() * redBiteTargetRect.height,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    "rgba(220, 38, 38, 0.9)",
                    25
                ));
            }

            // 判定：若玩家還在目標範圍內，且在地面上 (沒有起跳)
            const pRect = {x: player.x, y: player.y, width: player.width, height: player.height};
            if (checkOverlap(pRect, redBiteTargetRect)) {
                if (player.isGrounded || player.isClimbing) {
                    player.takeDamage("未能及時離開紅咬鎖定區，被龍牙重創！");
                }
            } else {
                // 躲避成功！飄出閃避護盾粒子
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(
                        player.x + player.width/2,
                        player.y + player.height/2,
                        (Math.random() - 0.5) * 3,
                        -Math.random() * 3,
                        "rgba(57, 255, 20, 0.8)",
                        15
                    ));
                }
            }
        }
        redBiteTargetRect = null;
    }

    // ------------------------------------------
    // 2. 紅閃 AI (兩側垂直落雷)
    // ------------------------------------------
    redLightningTimer -= dt;
    if (redLightningTimer <= 2.0 && !redLightningWarningActive) {
        redLightningWarningActive = true;
        SoundManager.play('warning');
        
        // 將中心點轉換為碰撞與繪製範圍 (套用檔案最上方的設定)
        redLightningXRanges = RED_LIGHTNING_CONFIG.positions.map(x => {
            return { min: x - RED_LIGHTNING_CONFIG.width/2, max: x + RED_LIGHTNING_CONFIG.width/2, center: x };
        });
        
        triggerAlertBanner("⚡ 雷電威脅！垂直閃電即將轟炸左右高台區！");
    }

    if (redLightningTimer <= 0) {
        redLightningWarningActive = false;
        redLightningTimer = 13.0 + Math.random() * 3.0; // 13-16s 重置
        hideAlertBanner();
        SoundManager.play('lightning');

        // 生成雷擊巨型粒子特效
        redLightningXRanges.forEach(range => {
            for (let k = 0; k < 5; k++) {
                const rx = range.min + Math.random() * (range.max - range.min);
                particles.push({
                    isLightningBolt: true,
                    x: rx,
                    width: 25 + Math.random()*15, // 雷擊寬度變窄一點點讓它更集中
                    life: 20
                });
            }

            // 檢查玩家 X 座標是否在雷擊 X 範圍內
            const pxCenter = player.x + player.width/2;
            if (pxCenter >= range.min && pxCenter <= range.max) {
                player.takeDamage("在左右外側高電壓雷區被【紅閃】垂直天雷劈中");
            }
        });
    }

    // ------------------------------------------
    // 3. 黑鎖 AI (隨機平台貫穿秒殺/重擊)
    // ------------------------------------------
    blackChainTimer -= dt;
    if (blackChainTimer <= 0.7 && !blackChainWarningActive) {
        blackChainWarningActive = true;
        SoundManager.play('warning');
        
        // 隨機選一個平台 (不包含底層，避免無處可躲)
        const candidatePlats = platforms.filter(p => p.name !== "底層地面");
        blackChainTargetPlat = candidatePlats[Math.floor(Math.random() * candidatePlats.length)];
        
        triggerAlertBanner(`⛓️ 黑鎖鎖定區域！速離鎖定 X 範圍！`);
    }

    if (blackChainTimer <= 0) {
        blackChainWarningActive = false;
        blackChainTimer = 15.0; // 15秒固定重置
        hideAlertBanner();
        
        // 播放重擊音效
        SoundManager.play('chain');

        // 巨型鐵鎖從天降落，貫穿全圖
        particles.push({
            isBlackChainStrike: true,
            plat: blackChainTargetPlat,
            life: 30
        });

        // 判定：只要 X 座標在鎖定的範圍內，不論在哪個高度都會被秒殺 (全圖貫穿)
        const pxCenter = player.x + player.width/2;
        if (pxCenter >= blackChainTargetPlat.xMin && pxCenter <= blackChainTargetPlat.xMax) {
            player.takeDamage(`未能及時撤離，被全圖貫穿的巨型黑鐵鎖鏈擊中`);
        }
        blackChainTargetPlat = null;
    }

    // ------------------------------------------
    // 4. 大噴火 AI (中央大範圍火焰秒殺)
    // ------------------------------------------
    fireBreathTimer -= dt;
    if (fireBreathTimer <= 1.5 && !fireBreathWarningActive) {
        fireBreathWarningActive = true;
        SoundManager.play('warning');
        triggerAlertBanner("🔥 龍王深呼吸！中央即將引發毀滅大噴火！速躲角落！");
    }

    if (fireBreathTimer <= 0) {
        fireBreathWarningActive = false;
        fireBreathTimer = 10.0 + Math.random() * 2.0; // 10~12秒重置
        hideAlertBanner();
        
        SoundManager.play('lightning'); // 借用雷聲作為深沉的噴火轟鳴

        // 中央區域 (大致為地圖中間三分之一)
        const fireMinX = 350;
        const fireMaxX = 670;
        
        // 產生大量往上衝的火焰粒子
        for (let k = 0; k < 60; k++) {
            particles.push(new Particle(
                fireMinX + Math.random() * (fireMaxX - fireMinX),
                canvas.height - Math.random() * 80,
                (Math.random() - 0.5) * 4,
                -(4 + Math.random() * 8), // 快速往上衝
                "rgba(255, 80, 0, 0.8)",
                30 + Math.random() * 40
            ));
            // 亮黃色核心
            particles.push(new Particle(
                fireMinX + Math.random() * (fireMaxX - fireMinX),
                canvas.height - Math.random() * 80,
                (Math.random() - 0.5) * 2,
                -(6 + Math.random() * 8),
                "rgba(255, 200, 0, 0.9)",
                15 + Math.random() * 20
            ));
        }

        // 全圖震動
        screenShake = 15;

        // 判定：只要 X 座標在中央範圍內，且在下半部 (y > 380)，就會被烤焦 (最上層平台安全)
        const pxCenter = player.x + player.width/2;
        if (pxCenter >= fireMinX && pxCenter <= fireMaxX && (player.y + player.height) > 400) {
            player.takeDamage(`未能及時逃到兩側或高處，被龍王下半部大噴火燒死`);
        }
    }

    // ------------------------------------------
    // 5. 法師魔心防禦消除 AI
    // ------------------------------------------
    if (player.jobType === 'mage' && !isGameOver) {
        if (!isMageDispelActive) {
            mageDispelTimer -= dt;
            if (mageDispelTimer <= 0) {
                isMageDispelActive = true;
                mageDispelTimer = 2.0; // 2秒反應時間
                triggerDispelAlertBanner("💀 龍王消除了你的【魔心防禦】！快按 Q 鍵重新施放！");
                SoundManager.play('warning');
            }
        } else {
            mageDispelTimer -= dt;
            if (mageDispelTimer <= 0) {
                isMageDispelActive = false;
                player.takeDamage("未能及時補上魔心防禦，遭到秒殺");
            }
        }
    }
}

// ==========================================
// 繪製與粒子特效更新
// ==========================================

function updateEntities(dt) {
    if (!isGameOver && isGameRunning && !isQuizActive) {
        if (activeSmokescreen) {
            activeSmokescreen.timer -= dt;
            if (activeSmokescreen.timer <= 0) {
                activeSmokescreen = null;
            } else {
                // 產生煙霧彈白霧粒子
                if (Math.random() < 0.4) {
                    particles.push(new Particle(
                        activeSmokescreen.x + Math.random() * activeSmokescreen.width,
                        activeSmokescreen.y + activeSmokescreen.height - Math.random() * 60,
                        (Math.random() - 0.5) * 1.5,
                        -Math.random() * 2,
                        "rgba(255, 255, 255, 0.5)",
                        30 + Math.random() * 30
                    ));
                }
            }
        }
        bambooSpawnTimer -= dt;
        if (bambooSpawnTimer <= 0) {
            bambooSpawnTimer = 10.0;
            // 隨機生成 7-8 個竹筍
            const numBamboos = 7 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numBamboos; i++) {
                // 隨機選一個平台 (扣除掉最左、右的空中邊界)
                const platform = platforms[Math.floor(Math.random() * platforms.length)];
                const bx = platform.xMin + Math.random() * (platform.xMax - platform.xMin);
                bamboos.push({
                    x: bx,
                    y: platform.y,
                    lifeTimer: 3.0,
                    struck: false,
                    displayTimer: 0.5 // 雷擊特效殘留時間
                });
            }
        }

        for (let i = bamboos.length - 1; i >= 0; i--) {
            const b = bamboos[i];
            if (!b.struck) {
                b.lifeTimer -= dt;
                if (b.lifeTimer <= 0) {
                    b.struck = true;
                    SoundManager.play('warning'); // 或者新增雷擊音效
                    
                    // 白雷判定區 (X 軸 +/- 20, Y軸全貫穿)
                    const lightningBox = {
                        x: b.x - 20,
                        y: 0,
                        width: 40,
                        height: b.y
                    };
                    
                    // 繪製雷擊粒子特效
                    for(let k=0; k<15; k++){
                        particles.push(new Particle(
                            b.x + (Math.random()-0.5)*40,
                            b.y - Math.random()*400,
                            (Math.random()-0.5)*2,
                            (Math.random()-0.5)*2,
                            "rgba(255, 255, 255, 0.9)",
                            20
                        ));
                    }

                    // 檢查玩家是否吃到
                    if (player && checkOverlap(player, lightningBox)) {
                        if (player.lightningBuff < 3) {
                            player.lightningBuff++;
                            SoundManager.play('click');
                            // 更新 UI
                            const bambooEl = document.getElementById("bamboo-count");
                            if (bambooEl) bambooEl.textContent = `${player.lightningBuff} / 3`;
                        } else if (player.lightningBuff === 3) {
                            player.lightningBuff = 4;
                            player.takeDamage("貪心吃太多竹筍雷，當場劈死！");
                        }
                    }
                }
            } else {
                b.displayTimer -= dt;
                if (b.displayTimer <= 0) {
                    bamboos.splice(i, 1);
                }
            }
        }
    }

    // 1. 更新飛鏢/箭矢投射物
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update();

        // 檢查是否擊中任何龍王頭部
        bossHeads.forEach(head => {
            const projBox = {
                x: proj.x - proj.size,
                y: proj.y - proj.size,
                width: proj.size * 2,
                height: proj.size * 2
            };

            if (proj.active && checkOverlap(projBox, head)) {
                damageBoss(head);
                if (!proj.pierce) proj.active = false; // 非穿透投射物則銷毀
            }
        });

        if (!proj.active) {
            projectiles.splice(i, 1);
        }
    }

    // 2. 更新飄浮傷害數字
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        damageNumbers[i].update();
        if (damageNumbers[i].life <= 0) {
            damageNumbers.splice(i, 1);
        }
    }

    // 3. 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isFlashOverlay || p.isLightningBolt || p.isBlackChainStrike) {
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        } else {
            p.update();
            if (p.life <= 0) particles.splice(i, 1);
        }
    }
}

function drawGame() {
    ctx.save();
    
    // 死亡視角特效 (只計算動畫時間，不縮放鏡頭，讓玩家看清楚死因)
    if (isGameOver && player && player.hp <= 0) {
        deathAnimTime += 0.015; 
    }

    // 畫面震動效果
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }

    // 1. 繪製背景 (若載入成功則繪製圖片，否則繪製藍黑神秘山洞漸層)
    if (bgImageLoaded) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        
        // 為了讓 UI 和特效更明顯，可以疊加一層淡淡的暗色遮罩
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 繪製紅咬目標預警框 (如果啟動)
        if (redBiteWarningActive && redBiteTargetRect) {
            ctx.save();
            // 閃爍效果
            const alpha = 0.4 + Math.sin(Date.now() / 50) * 0.3;
            ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
            ctx.strokeStyle = `rgba(220, 38, 38, 0.8)`;
            ctx.lineWidth = 3;
            
            // 畫出危險區
            ctx.fillRect(redBiteTargetRect.x, redBiteTargetRect.y, redBiteTargetRect.width, redBiteTargetRect.height);
            ctx.strokeRect(redBiteTargetRect.x, redBiteTargetRect.y, redBiteTargetRect.width, redBiteTargetRect.height);
            
            // 畫出獠牙警告圖示 (簡單的多邊形)
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.moveTo(redBiteTargetRect.x + 10, redBiteTargetRect.y);
            ctx.lineTo(redBiteTargetRect.x + 20, redBiteTargetRect.y + 20);
            ctx.lineTo(redBiteTargetRect.x + 30, redBiteTargetRect.y);
            ctx.moveTo(redBiteTargetRect.x + redBiteTargetRect.width - 30, redBiteTargetRect.y);
            ctx.lineTo(redBiteTargetRect.x + redBiteTargetRect.width - 20, redBiteTargetRect.y + 20);
            ctx.lineTo(redBiteTargetRect.x + redBiteTargetRect.width - 10, redBiteTargetRect.y);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(redBiteTargetRect.x + 10, redBiteTargetRect.y + redBiteTargetRect.height);
            ctx.lineTo(redBiteTargetRect.x + 20, redBiteTargetRect.y + redBiteTargetRect.height - 20);
            ctx.lineTo(redBiteTargetRect.x + 30, redBiteTargetRect.y + redBiteTargetRect.height);
            ctx.moveTo(redBiteTargetRect.x + redBiteTargetRect.width - 30, redBiteTargetRect.y + redBiteTargetRect.height);
            ctx.lineTo(redBiteTargetRect.x + redBiteTargetRect.width - 20, redBiteTargetRect.y + redBiteTargetRect.height - 20);
            ctx.lineTo(redBiteTargetRect.x + redBiteTargetRect.width - 10, redBiteTargetRect.y + redBiteTargetRect.height);
            ctx.fill();
            
            ctx.restore();
        }

    } else {
        let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, "#030712");
        bgGrad.addColorStop(0.5, "#0b0f19");
        bgGrad.addColorStop(1, "#030712");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. 繪製背景星雲魔光 (增加視覺Wow感 - 僅在無背景圖時明顯)
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(6, 182, 212, 0.03)";
        ctx.beginPath();
        ctx.arc(200, 200, 300, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "rgba(236, 72, 153, 0.03)";
        ctx.beginPath();
        ctx.arc(800, 400, 250, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    // 3. 繪製黑鎖預警：天空降下的鎖鏈 (全圖貫穿)
    if (blackChainWarningActive && blackChainTargetPlat) {
        ctx.save();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(40, 40, 40, 0.9)";
        ctx.setLineDash([15, 10]); // 創造類似鎖鏈節點的視覺效果
        
        // 根據剩餘時間計算鎖鏈降落的高度比例 (0 到 1)
        const dropRatio = Math.max(0, 1 - (blackChainTimer / 0.7));
        
        const step = (blackChainTargetPlat.xMax - blackChainTargetPlat.xMin) / 5;
        for (let i = 1; i <= 4; i++) {
            const cx = blackChainTargetPlat.xMin + i * step;
            // 貫穿到畫布最底部
            const currentY = -100 + dropRatio * (canvas.height + 100);
            
            ctx.beginPath();
            ctx.moveTo(cx, -100);
            ctx.lineTo(cx, currentY);
            ctx.stroke();
            
            // 鎖鏈尖端的威脅紅點
            ctx.fillStyle = "red";
            ctx.fillRect(cx - 3, currentY, 6, 15);
        }
        ctx.restore();
    }

    // 3. 繪製紅閃警告背景柱 (明顯閃爍與警告標語)
    if (redLightningWarningActive) {
        ctx.save();
        const blinkAlpha = 0.2 + Math.abs(Math.sin(Date.now() / 80)) * 0.3; // 0.2 ~ 0.5 強烈閃爍
        ctx.fillStyle = `rgba(255, 0, 0, ${blinkAlpha})`;
        redLightningXRanges.forEach(range => {
            ctx.fillRect(range.min, 0, range.max - range.min, canvas.height);
            // 邊線
            ctx.strokeStyle = `rgba(255, 0, 0, ${blinkAlpha + 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(range.min, 0); ctx.lineTo(range.min, canvas.height);
            ctx.moveTo(range.max, 0); ctx.lineTo(range.max, canvas.height);
            ctx.stroke();
            
            // 在柱子中間加上警告圖示
            ctx.fillStyle = `rgba(255, 255, 0, ${blinkAlpha + 0.4})`;
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("⚠️", range.center, 150);
            ctx.fillText("⚠️", range.center, 350);
            ctx.fillText("⚠️", range.center, 550);
        });
        ctx.restore();
    }

    if (SHOW_DEBUG_LINES) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]); // 虛線
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        
        RED_LIGHTNING_CONFIG.positions.forEach((x, idx) => {
            // 畫中心點垂直輔助線
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // 畫寬度範圍邊界線 (淡淡的)
            ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
            ctx.beginPath();
            ctx.moveTo(x - RED_LIGHTNING_CONFIG.width/2, 0);
            ctx.lineTo(x - RED_LIGHTNING_CONFIG.width/2, canvas.height);
            ctx.moveTo(x + RED_LIGHTNING_CONFIG.width/2, 0);
            ctx.lineTo(x + RED_LIGHTNING_CONFIG.width/2, canvas.height);
            ctx.stroke();
            
            // 畫文字標籤
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(x - 30, 40, 60, 25);
            ctx.fillStyle = "red";
            ctx.fillText(`紅閃 ${idx+1}`, x, 58);
        });
        ctx.restore();
    }

    // 4. 繪製大噴火警告背景 (只有下半部)
    if (fireBreathWarningActive) {
        ctx.save();
        const fireAlpha = 0.3 + Math.sin(Date.now() / 40) * 0.2;
        const fireStartY = 400; // 從 400 高度開始，不涵蓋最上層
        ctx.fillStyle = `rgba(255, 100, 0, ${fireAlpha})`;
        ctx.fillRect(350, fireStartY, 670 - 350, canvas.height - fireStartY);
        
        // 警告邊界
        ctx.strokeStyle = `rgba(255, 60, 0, ${fireAlpha + 0.3})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(350, fireStartY); ctx.lineTo(350, canvas.height);
        ctx.moveTo(670, fireStartY); ctx.lineTo(670, canvas.height);
        ctx.moveTo(350, fireStartY); ctx.lineTo(670, fireStartY); // 頂部水平線
        ctx.stroke();
        ctx.restore();
    }

    // 5. 繪製繩索 (精緻攀爬繩)
    if (!bgImageLoaded) {
        ropes.forEach(rope => {
            ctx.save();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            
            // 繩索主幹
            ctx.beginPath();
            ctx.moveTo(rope.x, rope.yMin);
            ctx.lineTo(rope.x, rope.yMax);
            ctx.stroke();

            // 綁繩節點紋路
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 4;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.moveTo(rope.x, rope.yMin);
            ctx.lineTo(rope.x, rope.yMax);
            ctx.stroke();
            
            // 繩頂固定木樁
            ctx.fillStyle = "#78350f";
            ctx.fillRect(rope.x - 8, rope.yMin - 6, 16, 8);

            ctx.restore();
        });
    }

    // 5. 繪製平台 (霓虹科幻石板)
    if (!bgImageLoaded) {
        platforms.forEach(plat => {
            ctx.save();
            // 實體底板與單向穿透平台顏色區分
            let glowColor = plat.isSolid ? "rgba(0, 240, 255, 0.35)" : "rgba(236, 72, 153, 0.25)";
            let strokeColor = plat.isSolid ? varGet('--color-cyan', "#00f0ff") : varGet('--color-pink', "#ff007f");
            
            // 黑鎖預警高亮
            if (blackChainWarningActive && blackChainTargetPlat === plat) {
                glowColor = "rgba(239, 68, 68, 0.4)";
                strokeColor = "#ff3344";
                ctx.shadowBlur = 20;
                ctx.shadowColor = "#ff3344";
            } else {
                ctx.shadowBlur = 10;
                ctx.shadowColor = strokeColor;
            }

            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;

            // 畫平台斜角石板
            ctx.beginPath();
            ctx.moveTo(plat.xMin, plat.y);
            ctx.lineTo(plat.xMax, plat.y);
            ctx.lineTo(plat.xMax - 10, plat.y + 16);
            ctx.lineTo(plat.xMin + 10, plat.y + 16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 石板表層防滑紋理
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(plat.xMin + 20, plat.y + 4);
            ctx.lineTo(plat.xMax - 20, plat.y + 4);
            ctx.stroke();

            ctx.restore();
        });
    } else {
        // 如果載入背景圖，只需要畫出黑鎖的紅光預警
        platforms.forEach(plat => {
            if (blackChainWarningActive && blackChainTargetPlat === plat) {
                ctx.save();
                ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
                ctx.fillRect(plat.xMin, plat.y - 5, plat.xMax - plat.xMin, 10);
                ctx.restore();
            }
        });
    }

    // 6. 繪製龍王各部位 (頭部)
    bossHeads.forEach(head => {
        head.update();
        if (!bgImageLoaded) {
            head.draw(ctx);
        } else {
            // 背景已載入時，只處理受傷閃白效果，不畫本體
            if (head.hurtFlashTicks > 0) {
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.beginPath();
                ctx.arc(head.x + head.radius, head.y + head.radius, head.radius, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }
    });

    // 7. 繪製玩家
    if (player) {
        player.update();
        player.draw(ctx);
    }

    // 7.5 繪製神偷煙霧彈結界
    if (activeSmokescreen) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        // 畫橢圓形底座
        ctx.ellipse(
            activeSmokescreen.x + activeSmokescreen.width / 2,
            activeSmokescreen.y + activeSmokescreen.height,
            activeSmokescreen.width / 2,
            30,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText(Math.ceil(activeSmokescreen.timer) + "s", 
            activeSmokescreen.x + activeSmokescreen.width / 2, 
            activeSmokescreen.y + activeSmokescreen.height - 40);
        ctx.restore();
    }

    // 7.6 繪製竹筍與白雷
    bamboos.forEach(b => {
        ctx.save();
        if (!b.struck) {
            // 畫竹筍本體
            ctx.fillStyle = "#22c55e"; // 綠色
            ctx.beginPath();
            ctx.moveTo(b.x, b.y); // 底部中點
            ctx.lineTo(b.x - 10, b.y);
            ctx.lineTo(b.x, b.y - 25);
            ctx.lineTo(b.x + 10, b.y);
            ctx.fill();
            
            // 畫竹節線條
            ctx.strokeStyle = "#14532d";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.x - 6, b.y - 8); ctx.lineTo(b.x + 6, b.y - 8);
            ctx.moveTo(b.x - 4, b.y - 16); ctx.lineTo(b.x + 4, b.y - 16);
            ctx.stroke();

            // 倒數提示小紅點/字
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.fillText(Math.ceil(b.lifeTimer), b.x - 4, b.y - 30);
        } else {
            // 畫白雷
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#ffffff";
            let grad = ctx.createLinearGradient(b.x, 0, b.x, b.y);
            grad.addColorStop(0, "rgba(255, 255, 255, 1)");
            grad.addColorStop(0.8, "rgba(200, 255, 255, 0.9)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
            
            ctx.fillStyle = grad;
            ctx.globalAlpha = b.displayTimer / 0.5;
            
            // 畫主幹
            ctx.fillRect(b.x - 12, 0, 24, b.y);
        }
        ctx.restore();
    });

    // 8. 繪製投射物
    projectiles.forEach(proj => proj.draw(ctx));

    // 9. 繪製一般粒子與特殊雷擊/黑鎖特效粒子
    particles.forEach(p => {
        if (p.isFlashOverlay) { // 全畫面紅咬紅光閃爍
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 12;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        } else if (p.isLightningBolt) { // 紅閃垂直巨型雷柱
            ctx.save();
            ctx.shadowBlur = 30;
            ctx.shadowColor = "#ff3344";
            let grad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
            grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            grad.addColorStop(0.3, "rgba(255, 51, 68, 0.7)");
            grad.addColorStop(1, "rgba(255, 51, 68, 0)");
            ctx.fillStyle = grad;
            ctx.globalAlpha = p.life / 20;
            ctx.fillRect(p.x - p.width/2, 0, p.width, canvas.height);
            ctx.restore();
        } else if (p.isBlackChainStrike) { // 黑鎖地獄貫穿
            ctx.save();
            ctx.lineWidth = 14;
            ctx.strokeStyle = "#1a1a1a";
            ctx.setLineDash([18, 12]); // 鎖鏈視覺
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ff0000";
            ctx.globalAlpha = p.life / 30;

            // 繪製 4 根垂直貫穿鎖鏈
            const step = (p.plat.xMax - p.plat.xMin) / 5;
            for (let i = 1; i <= 4; i++) {
                const cx = p.plat.xMin + i * step;
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                // 貫穿全圖
                ctx.lineTo(cx, canvas.height);
                ctx.stroke();
                
                // 刺穿爆炸黃紅光 (在整個畫面的垂直高度隨機產生幾個爆炸點)
                ctx.fillStyle = "rgba(255, 80, 0, 0.8)";
                for (let e = 1; e <= 3; e++) {
                    ctx.beginPath();
                    ctx.arc(cx, (canvas.height/4) * e, 35 * (p.life/30), 0, Math.PI*2);
                    ctx.fill();
                }
            }
            ctx.restore();
        } else {
            p.draw(ctx);
        }
    });

    // 10. 繪製傷害數字
    damageNumbers.forEach(num => num.draw(ctx));

    ctx.restore();
}

// 獲取 CSS 變數備用
function varGet(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
}

// 繪製圓角矩形輔助函數
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ==========================================
// 遊戲主循環與結算
// ==========================================

function gameLoop(now) {
    if (!isGameRunning) return;

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // 如果煙霧彈問答啟動，暫停其他邏輯更新
    if (isQuizActive && !isGameOver) {
        quizTimer -= dt;
        const chatTimerEl = document.getElementById('chat-timer');
        if (chatTimerEl) chatTimerEl.textContent = `剩餘作答時間：${quizTimer.toFixed(1)}s`;

        if (quizTimer <= 0) {
            isQuizActive = false;
            document.getElementById("chat-box-container").style.display = "none";
            document.getElementById("chat-input").blur();
            player.takeDamage("煙霧彈持續時間計算失敗，遭到秒殺");
        }
        
        drawGame(); // 保持畫面繪製
        animationFrameId = requestAnimationFrame(gameLoop);
        return; 
    }

    // 更新計時與關卡
    if (!isGameOver) {
        survivalTime += dt;
        const timerEl = document.getElementById("game-timer");
        if (timerEl) {
            timerEl.textContent = `${survivalTime.toFixed(1)}s`;
        }

        globalGameTimer -= dt;
        const clockEl = document.getElementById("game-clock");
        if (clockEl) {
            const m = Math.floor(globalGameTimer / 60);
            const s = Math.floor(globalGameTimer % 60);
            clockEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        // 當存活大於 60 秒時，進入特訓成功結算！
        if (survivalTime >= 60.0) {
            triggerGameOver(true);
        }
    }

    // 更新龍王 AI 與物理
    updateBossSkills(dt);
    updateEntities(dt);
    
    // 渲染
    drawGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ==========================================
// UI 與告示牌輔助函數
// ==========================================

function triggerAlertBanner(msg) {
    const banner = document.getElementById("alert-banner");
    const text = document.getElementById("alert-text");
    if (banner && text) {
        text.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${msg}`;
        banner.classList.add("active");
    }
}

function hideAlertBanner() {
    const banner = document.getElementById("alert-banner");
    if (banner) {
        banner.classList.remove("active");
    }
}

function triggerDispelAlertBanner(msg) {
    const banner = document.getElementById("dispel-alert-banner");
    const text = document.getElementById("dispel-alert-text");
    if (banner && text) {
        text.innerHTML = `<i class="fas fa-magic"></i> ${msg}`;
        banner.classList.add("active");
    }
}

function hideDispelAlertBanner() {
    const banner = document.getElementById("dispel-alert-banner");
    if (banner) {
        banner.classList.remove("active");
    }
}

// 更新生命值心形 UI
function updateHeartsUI(hp) {
    const hearts = document.querySelectorAll("#hp-hearts i");
    hearts.forEach((heart, idx) => {
        if (idx < hp) {
            heart.className = "fas fa-heart heart-active";
        } else {
            heart.className = "fas fa-heart heart-lost";
        }
    });

    ctx.restore(); // 結束基本畫面繪製 (包含死亡時的縮放)

    // 如果死亡，在最上層加上悲壯的紅色/黑色濾鏡和文字
    if (isGameOver && player && player.hp <= 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置矩陣，畫滿整個原始大小畫面
        const alpha = Math.min(0.7, deathAnimTime * 0.4);
        
        // 暗紅色遮罩
        ctx.fillStyle = `rgba(80, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // YOU DIED 文字 (帶有慢速浮現效果)
        if (deathAnimTime > 0.5) {
            const textAlpha = Math.min(1.0, (deathAnimTime - 0.5) * 2);
            ctx.fillStyle = `rgba(255, 0, 0, ${textAlpha})`;
            ctx.font = "bold 80px 'Orbitron', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText("WASTED", canvas.width / 2, canvas.height / 2);
        }
        ctx.restore();
    }
}

// 更新攻擊打擊進度條
function updateDpsBar(hits) {
    const fill = document.getElementById("dps-progress");
    const text = document.getElementById("dps-text");
    if (fill && text) {
        const pct = Math.min(100, (hits / dpsTarget) * 100);
        fill.style.width = `${pct}%`;
        text.textContent = `${hits} / ${dpsTarget}`;
    }
}

// ==========================================
// 結算與排行榜保存
// ==========================================

function triggerGameOver(isSuccess, reason = "") {
    if (isGameOver) return; // 避免重複觸發
    isGameOver = true;
    // 移除 isGameRunning = false; 讓畫面繼續更新來播放死亡動畫

    // 檢查攻擊次數門檻是否達成
    const dpsAchieved = dpsHits >= dpsTarget;
    let finalSuccess = isSuccess && dpsAchieved;
    
    // 若存活到60秒但攻擊不足，判定失敗
    let finalReason = reason;
    if (isSuccess && !dpsAchieved) {
        finalSuccess = false;
        finalReason = `存活滿60秒，但對龍王攻擊次數僅有 ${dpsHits} 次（未達合格門檻 ${dpsTarget} 次）！`;
    }

    // 播放勝敗音樂
    if (finalSuccess) {
        SoundManager.play('win');
    } else {
        SoundManager.play('lose');
    }

    // 填寫結算卡
    const modal = document.getElementById("result-modal");
    const title = document.getElementById("result-title");
    const subtitle = document.getElementById("result-subtitle");
    const iconContainer = document.getElementById("result-icon-container");
    const icon = document.getElementById("result-icon");
    const statTime = document.getElementById("stat-time");
    const statHits = document.getElementById("stat-hits");
    const statReason = document.getElementById("stat-reason");

    if (finalSuccess) {
        title.textContent = "特訓成功！";
        title.className = "text-cyan";
        subtitle.textContent = "生存完美通關 & 完成攻擊任務";
        iconContainer.className = "result-icon-box success";
        icon.className = "fas fa-trophy";
        statReason.textContent = "完美達成特訓！您已成功掌握龍王的三大走位躲避頻率並完成輸出！";
    } else {
        title.textContent = "特訓失敗！";
        title.className = "text-red";
        subtitle.textContent = "生命值扣光 或 攻擊輸出不足";
        iconContainer.className = "result-icon-box failure";
        icon.className = "fas fa-skull";
        statReason.textContent = finalReason || "生命值受創達3次死亡。";
    }

    statTime.textContent = `${survivalTime.toFixed(1)}s`;
    statHits.textContent = `${dpsHits} 次`;

    statTime.textContent = `${survivalTime.toFixed(1)}s`;
    statHits.textContent = `${dpsHits} 次`;

    // 顯示結算
    if (!finalSuccess) {
        // 失敗的話，延遲 3 秒才跳出結算畫面，讓玩家看死亡視角
        setTimeout(() => {
            modal.classList.add("active");
        }, 3000);
    } else {
        modal.classList.add("active");
    }

    // 保存進排行榜
    const nameInput = document.getElementById("player-name");
    const playerName = nameInput.value.trim() || "神秘特務";
    saveScore(playerName, player.config.className, finalSuccess, survivalTime, dpsHits);
}

// 排行榜分數保存 (LocalStorage)
function saveScore(name, job, isSuccess, time, hits) {
    let leaderboard = JSON.parse(localStorage.getItem('ht_dodge_leaderboard_v2')) || [];
    
    // 加入本次紀錄
    leaderboard.push({
        name: name,
        job: job,
        isSuccess: isSuccess,
        time: parseFloat(time.toFixed(1)),
        hits: hits,
        timestamp: Date.now()
    });

    // 排序優先序：
    // 1. 特訓成功者排前面
    // 2. 存活時間高者排前面
    // 3. 攻擊次數多者排前面
    leaderboard.sort((a, b) => {
        if (a.isSuccess !== b.isSuccess) {
            return a.isSuccess ? -1 : 1;
        }
        if (b.time !== a.time) {
            return b.time - a.time;
        }
        return b.hits - a.hits;
    });

    // 最多留 15 筆
    leaderboard = leaderboard.slice(0, 15);
    localStorage.setItem('ht_dodge_leaderboard_v2', JSON.stringify(leaderboard));
}

// 排行榜 UI 載入與填充
function loadLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;

    const leaderboard = JSON.parse(localStorage.getItem('ht_dodge_leaderboard_v2')) || [];
    
    if (leaderboard.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">暫無特訓紀錄，等待您的挑戰！</td></tr>`;
        return;
    }

    list.innerHTML = leaderboard.map((record, index) => {
        const rankClass = index === 0 ? "rank-1" : (index === 1 ? "rank-2" : (index === 2 ? "rank-3" : ""));
        const successTag = record.isSuccess ? `<span class="text-cyan font-bold">成功</span>` : `<span class="text-red">失敗</span>`;
        return `
            <tr>
                <td class="lead-rank ${rankClass}">${index + 1}</td>
                <td class="font-bold">${escapeHtml(record.name)}</td>
                <td style="color: #94a3b8;">${record.job}</td>
                <td class="font-cyber text-yellow">${record.time}s (${successTag})</td>
                <td class="font-cyber text-pink">${record.hits}次</td>
            </tr>
        `;
    }).join('');
}

// 防止 HTML 注入
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 頁面加載完成後自動載入排行榜
window.addEventListener('load', () => {
    loadLeaderboard();
});

// 煙霧彈聊天輸入框監聽
document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (!isQuizActive) return;
        const val = this.value.trim();
        const expectedNoColon = expectedQuizAnswer.replace(":", "");
        if (val === expectedQuizAnswer || val === expectedNoColon) {
            // 答對了
            isQuizActive = false;
            document.getElementById("chat-box-container").style.display = "none";
            this.blur();
            triggerAlertBanner("✅ 煙霧彈部署成功！獲得 20 秒結界無敵！");
            setTimeout(hideAlertBanner, 2000);
            
            // 產生 20 秒無敵結界
            activeSmokescreen = {
                x: player.x + player.width / 2 - 150, // 寬度 300 的中心
                y: player.y + player.height - 120, // 高度 120，貼齊地板
                width: 300,
                height: 120,
                timer: 20.0
            };
        } else {
            // 答錯了
            isQuizActive = false;
            document.getElementById("chat-box-container").style.display = "none";
            this.blur();
            player.takeDamage("煙霧彈時間計算錯誤，遭到秒殺");
        }
    }
    e.stopPropagation(); // 防止觸發其他快捷鍵
});
