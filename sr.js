// Canvas setup
const canvas = document.getElementById('birthdayCanvas');
const ctx = canvas.getContext('2d');

// Music controls
const music = document.getElementById('birthdayMusic');
const musicToggle = document.getElementById('musicToggle');
const volumeControl = document.getElementById('volumeControl');

// Game states
const STATES = {
    BIRTHDAY_TEXT: 'birthdayText',
    GIFT_BOXES: 'giftBoxes',
    RESULT: 'result',
    FINAL_LOOP: 'finalLoop'
};
let currentState = STATES.BIRTHDAY_TEXT;
let correctBoxIndex = Math.floor(Math.random() * 4);

// Messages configuration
const birthdayMessages = ["曹燕", "生日快乐", "学业有成", "万事如意", "请找到你的礼物"];
const resultMessages = {
    success: "北门东湖美食街彩票店",
    notice: "请注意查收哦",
    final: ["北门东湖美食街彩票店", "请注意查收哦"]
};
let currentMessageIndex = 0;
let particles = [];
const particlesPerText = 20000;  // 减少粒子数量
let isTransitioning = false;

// Particle class
class Particle {
    constructor(x, y, isStatic = true) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = x;
        this.targetY = y;
        // 更丰富的粒子大小分布
        const sizeRange = Math.random();
        if (sizeRange < 0.3) {
            this.size = Math.random() * 0.5 + 0.2; // 小粒子
        } else if (sizeRange < 0.8) {
            this.size = Math.random() * 0.8 + 0.5; // 中等粒子
        } else {
            this.size = Math.random() * 1.2 + 0.8; // 大粒子
        }
        this.baseSize = this.size;
        this.isStatic = isStatic;
        
        // 简化的运动属性
        this.speed = Math.random() * 9 + 2; // 散开速度
        this.angle = Math.random() * Math.PI * 2; // 散开角度
        this.acceleration = 0.1; // 向目标移动的加速度
        
        // 颜色
        const colors = [
            `hsl(${Math.random() * 60 + 330}, 100%, 75%)`,  // 粉色
            `hsl(${Math.random() * 60 + 180}, 100%, 75%)`,  // 青色
            `hsl(${Math.random() * 60 + 40}, 100%, 75%)`,   // 金色
            `hsl(${Math.random() * 60 + 280}, 100%, 85%)`,  // 紫色
            `hsl(0, 100%, 85%)`                             // 红色
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        if (this.isStatic) {
            // 向目标位置移动
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * this.acceleration;
            this.y += dy * this.acceleration;
        } else {
            // 简单的散开运动
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.speed *= 0.98; // 逐渐减速
        }
        
        this.size = this.baseSize * (1 + Math.sin(Date.now() * 0.01) * 0.1);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 创建多行粒子文字
function createParticleText(text, isStatic = true) {
    particles = [];
    ctx.font = 'bold 200px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 如果是地址信息，分两行显示
    if (text === resultMessages.success) {
        const lines = ['北门东湖', '美食街彩票店'];
        const lineHeight = 150; // 行间距
        
        lines.forEach((line, index) => {
            ctx.font = 'bold 150px Arial'; // 稍微减小字体大小
            const y = canvas.height/2 + (index - 0.5) * lineHeight;
            ctx.fillText(line, canvas.width/2, y);
            const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = textData.data;
            
            for (let i = 0; i < particlesPerText/2; i++) {
                let x, y;
                let found = false;
                
                while (!found) {
                    x = Math.floor(Math.random() * canvas.width);
                    y = Math.floor(Math.random() * canvas.height);
                    const index = (y * canvas.width + x) * 4;
                    
                    if (pixels[index + 3] > 128) {
                        found = true;
                        particles.push(new Particle(x, y, isStatic));
                    }
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    } else {
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = textData.data;
        
        for (let i = 0; i < particlesPerText; i++) {
            let x, y;
            let found = false;
            
            while (!found) {
                x = Math.floor(Math.random() * canvas.width);
                y = Math.floor(Math.random() * canvas.height);
                const index = (y * canvas.width + x) * 4;
                
                if (pixels[index + 3] > 128) {
                    found = true;
                    particles.push(new Particle(x, y, isStatic));
                }
            }
        }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 直接渲染普通文字
function drawNormalText(text) {
    particles = [];
    ctx.font = 'bold 150px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 使用渐变色
    const gradient = ctx.createLinearGradient(
        canvas.width/2 - 200,
        canvas.height/2 - 100,
        canvas.width/2 + 200,
        canvas.height/2 + 100
    );
    gradient.addColorStop(0, '#ff69b4');  // 粉色
    gradient.addColorStop(0.5, '#4169e1'); // 蓝色
    gradient.addColorStop(1, '#ffd700');   // 金色
    
    ctx.fillStyle = gradient;
    ctx.fillText(text, canvas.width/2, canvas.height/2);
}

// 直接显示 emoji
function drawEmoji(emoji) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
}

// 处理点击事件
function handleClick(event) {
    if (isTransitioning) return;
    
    if (currentState === STATES.BIRTHDAY_TEXT) {
        isTransitioning = true;
        particles.forEach(p => p.isStatic = false);
        
        setTimeout(() => {
            particles = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nextMessage();
        }, 1500);
    } else if (currentState === STATES.GIFT_BOXES) {
        handleGiftClick(event);
    } else if (currentState === STATES.FINAL_LOOP) {
        isTransitioning = true;
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        setTimeout(() => {
            createParticleText(resultMessages.final[Math.floor(Date.now() / 3000) % 2 === 0 ? 1 : 0]);
            isTransitioning = false;
        }, 500);
    }
}

function handleGiftClick(event) {
    if (isTransitioning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const boxWidth = canvas.width / 5;
    const boxHeight = boxWidth;
    const spacing = boxWidth / 2;
    const startX = (canvas.width - (3 * boxWidth + 2 * spacing)) / 2;
    const startY = canvas.height / 2 - boxHeight / 2;

    for (let i = 0; i < 4; i++) {
        const bx = startX + (i % 2) * (boxWidth + spacing);
        const by = startY + Math.floor(i / 2) * (boxHeight + spacing);
        
        if (x >= bx && x <= bx + boxWidth && y >= by && y <= by + boxHeight) {
            isTransitioning = true;
            
            if (i === correctBoxIndex) {
                // 清除现有内容并显示蛋糕表情
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawEmoji("🎂");
                
                // 显示地址文字
                setTimeout(() => {
                    particles = [];
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    createParticleText(resultMessages.success);
                    
                    // 显示提示文字
                    setTimeout(() => {
                        particles = [];
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        createParticleText(resultMessages.notice);
                        currentState = STATES.FINAL_LOOP;
                        isTransitioning = false;
                    }, 3000);
                }, 2000);
            } else {
                // 显示小丑表情
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawEmoji("🤡");
                
                // 重置礼物选择
                setTimeout(() => {
                    correctBoxIndex = Math.floor(Math.random() * 4);
                    drawGiftBoxes();
                    isTransitioning = false;
                }, 2000);
            }
            break;
        }
    }
}

function nextMessage() {
    currentMessageIndex++;
    if (currentMessageIndex < birthdayMessages.length) {
        currentState = STATES.BIRTHDAY_TEXT;
        createParticleText(birthdayMessages[currentMessageIndex], true);
    } else {
        currentState = STATES.GIFT_BOXES;
        particles = [];
        drawGiftBoxes();
    }
    isTransitioning = false;
}

// 绘制礼物盒子
function drawGiftBoxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const boxWidth = canvas.width / 5;
    const boxHeight = boxWidth;
    const spacing = boxWidth / 2;
    const startX = (canvas.width - (3 * boxWidth + 2 * spacing)) / 2;
    const startY = canvas.height / 2 - boxHeight / 2;
    
    const giftColors = [
        { box: '#FF69B4', ribbon: '#4169E1', highlight: '#FFB6C1' },  // 粉色盒子，蓝色丝带
        { box: '#4169E1', ribbon: '#FFD700', highlight: '#6495ED' },  // 蓝色盒子，金色丝带
        { box: '#9370DB', ribbon: '#98FB98', highlight: '#B19CD9' },  // 紫色盒子，浅绿丝带
        { box: '#20B2AA', ribbon: '#FF69B4', highlight: '#48D1CC' }   // 青色盒子，粉色丝带
    ];

    for (let i = 0; i < 4; i++) {
        const x = startX + (i % 2) * (boxWidth + spacing);
        const y = startY + Math.floor(i / 2) * (boxHeight + spacing);
        const colors = giftColors[i];

        // 绘制盒子阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // 绘制盒子主体
        ctx.fillStyle = colors.box;
        ctx.fillRect(x, y, boxWidth, boxHeight);

        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 绘制高光效果
        ctx.fillStyle = colors.highlight;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + boxWidth * 0.2, y);
        ctx.lineTo(x, y + boxHeight * 0.2);
        ctx.fill();

        // 绘制丝带
        ctx.fillStyle = colors.ribbon;
        // 垂直丝带
        ctx.fillRect(x + boxWidth * 0.45, y, boxWidth * 0.1, boxHeight);
        // 水平丝带
        ctx.fillRect(x, y + boxHeight * 0.45, boxWidth, boxHeight * 0.1);
        
        // 绘制蝴蝶结
        const bowSize = boxWidth * 0.2;
        ctx.beginPath();
        ctx.arc(x + boxWidth * 0.5, y + boxHeight * 0.45, bowSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 动画循环
function animate() {
    if (particles.length > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }
    
    requestAnimationFrame(animate);
}

// 初始化
function init() {
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createParticleText(birthdayMessages[0], true);
    animate();
}

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 音乐控制
musicToggle.addEventListener('click', () => {
    if (music.paused) {
        music.play();
        musicToggle.innerHTML = '<span class="music-icon">🔊</span>';
    } else {
        music.pause();
        musicToggle.innerHTML = '<span class="music-icon">🔇</span>';
    }
});

volumeControl.addEventListener('input', (e) => {
    music.volume = e.target.value;
});

// 启动游戏
init();

// 尝试自动播放音乐
music.volume = 0.5;
const playPromise = music.play();
if (playPromise !== undefined) {
    playPromise.catch(() => {
        musicToggle.innerHTML = '<span class="music-icon">🔇</span>';
    });
}