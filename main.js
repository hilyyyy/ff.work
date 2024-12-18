// 获取 HTML 元素
const startBtn = document.getElementById("startBtn");
const animationElement = document.getElementById("animation");
const resultDiv = document.getElementById("result");
const treasureImage = document.getElementById("treasure-image");
const backgroundMusic = document.getElementById("background-music");

// 地图上各个区域的位置和范围（假设每个区域的范围为矩形）
const locations = [
    { name: "沙滩", x: 200, y: 50, width: 120, height: 80, tipId: "beach-tip" },
    { name: "树林", x: 100, y: 200, width: 120, height: 80, tipId: "forest-tip" },
    { name: "山洞", x: 50, y: 350, width: 120, height: 80, tipId: "cave-tip" },
    { name: "古城", x: 350, y: 100, width: 120, height: 80, tipId: "ancient-city-tip" },
    { name: "藏宝船", x: 350, y: 300, width: 120, height: 80, tipId: "shipwreck-tip" },
    { name: "图书馆", x: 450, y: 150, width: 120, height: 80, tipId: "library-tip" },
    { name: "神庙", x: 500, y: 400, width: 120, height: 80, tipId: "temple-tip" },
    { name: "守卫岗", x: 550, y: 250, width: 120, height: 80, tipId: "guard-post-tip" }
];

let treasureLocation = null;
let playerPosition = { x: 0, y: 0 };  // 初始位置在家中
let playerData = JSON.parse(localStorage.getItem("playerData")) || { id: "player1", nickname: "玩家1", gameHistory: [] };

// 异步加载区域资料
function loadLocationData() {
    fetch("data.txt")
        .then(response => response.text())
        .then(data => {
            const lines = data.split("\n");
            const locationsData = {};
            lines.forEach(line => {
                const [location, info] = line.split(":");
                locationsData[location.trim()] = info.trim();
            });
            console.log(locationsData);
        });
}

// 随机生成宝藏位置（宝藏会在某个区域内）
function setTreasureLocation() {
    const randomIndex = Math.floor(Math.random() * locations.length);
    treasureLocation = locations[randomIndex];
    console.log("宝藏位置:", treasureLocation.name);
}

// 判断小球是否进入了某个区域并更新提示
function checkRegionEntered() {
    let treasureFound = false;

    locations.forEach(location => {
        const tipElement = document.getElementById(location.tipId);

        if (
            playerPosition.x >= location.x &&
            playerPosition.x <= location.x + location.width &&
            playerPosition.y >= location.y &&
            playerPosition.y <= location.y + location.height
        ) {
            // 小球进入了该区域
            tipElement.style.left = `${playerPosition.x}px`;
            tipElement.style.top = `${playerPosition.y - 30}px`;
            tipElement.style.display = 'block';

            if (treasureLocation && treasureLocation.name === location.name) {
                treasureFound = true;
            }
        } else {
            tipElement.style.display = 'none';
        }
    });

    if (treasureFound) {
        resultDiv.textContent = `恭喜！你找到了宝藏！(${treasureLocation.name})`;
        treasureImage.style.display = 'block';
    }
}

// 更新小球位置
function updatePlayerPosition() {
    animationElement.style.left = `${playerPosition.x}px`;
    animationElement.style.top = `${playerPosition.y}px`;
}

// 监听键盘事件控制小球移动
document.addEventListener("keydown", function(event) {
    const moveAmount = 10;

    switch (event.key.toLowerCase()) {
        case "w":
            playerPosition.y -= moveAmount;
            break;
        case "s":
            playerPosition.y += moveAmount;
            break;
        case "a":
            playerPosition.x -= moveAmount;
            break;
        case "d":
            playerPosition.x += moveAmount;
            break;
        default:
            break;
    }

    updatePlayerPosition();
    checkRegionEntered();
});

// 点击开始按钮时启动游戏
startBtn.addEventListener("click", function() {
    resultDiv.textContent = '';  // 清除之前的结果信息
    treasureImage.style.display = 'none';  // 隐藏宝藏图片

    setTreasureLocation();
    playerPosition = { x: 0, y: 0 };  // 重置玩家位置到起始位置
    updatePlayerPosition();
    checkRegionEntered();  // 检查玩家是否进入了宝藏区域

    const musicToggleBtn = document.getElementById("music-toggle-btn");
    const backgroundMusic = document.getElementById("background-music");

    // 初始状态设置为播放
    let isMusicPlaying = true;

    // 播放/暂停音乐的控制逻辑
    musicToggleBtn.addEventListener("click", function () {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            musicToggleBtn.textContent = "播放音乐";  // 更新按钮文本为“播放音乐”
        } else {
            backgroundMusic.play();
            musicToggleBtn.textContent = "暂停音乐";  // 更新按钮文本为“暂停音乐”
        }

        // 切换音乐播放状态
        isMusicPlaying = !isMusicPlaying;
    });

    // 页面加载时自动播放音乐
    backgroundMusic.play();

});

// 存储玩家数据到 localStorage
function savePlayerData() {
    localStorage.setItem("playerData", JSON.stringify(playerData));
}

// 获取玩家昵称并存储
function getPlayerNickname() {
    const nickname = prompt("请输入您的昵称：", playerData.nickname);
    if (nickname && nickname.trim() !== "") {
        playerData.nickname = nickname.trim();
        savePlayerData();  // 保存到 localStorage
    }
}

// 加载玩家历史记录
function loadGameHistory() {
    const history = playerData.gameHistory || [];
    if (history.length > 0) {
        alert("上次游戏记录：" + history.join(", "));
    }
}

// 开始游戏时，加载玩家数据
document.addEventListener("DOMContentLoaded", function () {
    loadGameHistory();
    getPlayerNickname();
    loadLocationData();  // 加载区域资料
});

// 提供一个退出游戏的按钮和处理逻辑
const exitBtn = document.createElement("button");
exitBtn.textContent = "退出游戏";
document.body.appendChild(exitBtn);

exitBtn.addEventListener("click", function () {
    if (confirm("你确定要退出游戏吗？")) {
        // 将玩家的当前游戏状态保存下来
        playerData.gameHistory.push(`游戏结束：宝藏位置 - ${treasureLocation ? treasureLocation.name : "未知"}`);
        savePlayerData();
        alert("感谢您的参与，期待下次再见！");
        window.location.reload();  // 刷新页面，重置游戏
    }
});
