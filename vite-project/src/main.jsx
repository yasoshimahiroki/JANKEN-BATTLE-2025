// =============================
// 初期設定
// =============================
const allCards = [
    { name: "剣", type: "attack", power: 10, cost: 0, effect: "10ダメージ" },
    { name: "強斬り", type: "attack", power: 25, cost: 15, effect: "25ダメージ" },
    { name: "魔法の矢", type: "attack", power: 15, cost: 5, effect: "15ダメージ" },
    { name: "薬草", type: "heal", power: 20, cost: 10, effect: "HPを20回復" },
    { name: "魔力の源", type: "support", power: 30, cost: 0, effect: "MPを30回復" }
];

const START_HP = 100;
const START_MP = 50;
const START_HAND_NUM = 5;

let player, cpu, deck, discardPile, isPlayerTurn, cardUsedThisTurn;

// =============================
// DOM要素の取得
// =============================
const playerHpEl = document.getElementById('player-hp');
const playerMpEl = document.getElementById('player-mp');
const cpuHpEl = document.getElementById('cpu-hp');
const cpuMpEl = document.getElementById('cpu-mp');
const playerHandEl = document.getElementById('player-hand');
const cpuHandEl = document.getElementById('cpu-hand');
const deckCountEl = document.getElementById('deck-count');
const discardCountEl = document.getElementById('discard-count');
const messageAreaEl = document.getElementById('message-area');
const endTurnButton = document.getElementById('end-turn-button');
const gameOverModal = document.getElementById('game-over-modal');
const gameOverMessageEl = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');

// =============================
// ゲームのコアロジック
// =============================

// ゲームの初期化
function initGame() {
    player = { hp: START_HP, mp: START_MP, hand: [] };
    cpu = { hp: START_HP, mp: START_MP, hand: [] };
    deck = createDeck();
    discardPile = [];
    isPlayerTurn = true;
    cardUsedThisTurn = false;

    // 初期手札を配る
    for (let i = 0; i < START_HAND_NUM; i++) {
        drawCard(player);
        drawCard(cpu);
    }
    
    updateUI();
    setMessage("あなたのターンです。");
    gameOverModal.classList.add('hidden');
}

// 山札を作成してシャッフル
function createDeck() {
    const newDeck = [];
    // 各カードを4枚ずつ山札に追加
    for (const card of allCards) {
        for (let i = 0; i < 4; i++) {
            newDeck.push({ ...card });
        }
    }
    // シャッフル (Fisher-Yates algorithm)
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

// カードを引く
function drawCard(target) {
    if (deck.length === 0) {
        checkGameOver(); // 山札切れでゲームオーバー
        return;
    }
    target.hand.push(deck.pop());
}

// カードを使用する
function playCard(card, user, opponent) {
    // MPが足りるかチェック
    if (user.mp < card.cost) {
        setMessage("MPが足りません！");
        return;
    }

    user.mp -= card.cost;
    
    // カードの効果を適用
    switch (card.type) {
        case 'attack':
            opponent.hp -= card.power;
            setMessage(`${user === player ? 'プレイヤー' : 'CPU'}が「${card.name}」を使用！ ${opponent === player ? 'プレイヤー' : 'CPU'}に${card.power}のダメージ！`);
            break;
        case 'heal':
            user.hp += card.power;
            setMessage(`${user === player ? 'プレイヤー' : 'CPU'}が「${card.name}」を使用！ HPが${card.power}回復した。`);
            break;
        case 'support':
            user.mp += card.power;
            setMessage(`${user === player ? 'プレイヤー' : 'CPU'}が「${card.name}」を使用！ MPが${card.power}回復した。`);
            break;
    }

    // 手札から捨て札へ移動
    user.hand = user.hand.filter(c => c !== card);
    discardPile.push(card);

    cardUsedThisTurn = true;
    updateUI();
    checkGameOver();
}

// ターン終了
function endTurn() {
    if (!isPlayerTurn) return; // CPUターン中はボタンを押せない

    // プレイヤーのターン終了処理
    isPlayerTurn = false;
    cardUsedThisTurn = false;
    setMessage("CPUのターンです。");
    endTurnButton.disabled = true;

    // 1枚ドロー
    drawCard(player);
    updateUI();

    // CPUのターンを実行
    setTimeout(cpuTurn, 1500);
}

// CPUの思考と行動
function cpuTurn() {
    if (checkGameOver()) return;

    // 使用可能なカードを探す
    const playableCards = cpu.hand.filter(card => card.cost <= cpu.mp);

    if (playableCards.length > 0) {
        // 簡単なAI: ランダムに使えるカードを1枚選ぶ
        const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        playCard(cardToPlay, cpu, player);
    } else {
        setMessage("CPUは何もできなかった！");
    }

    // CPUのターン終了処理
    setTimeout(() => {
        if (checkGameOver()) return;
        drawCard(cpu);
        isPlayerTurn = true;
        cardUsedThisTurn = false;
        setMessage("あなたのターンです。");
        endTurnButton.disabled = false;
        updateUI();
    }, 1500);
}

// 勝敗判定
function checkGameOver() {
    if (player.hp <= 0) {
        showGameOver("あなたの負けです...");
        return true;
    }
    if (cpu.hp <= 0) {
        showGameOver("あなたの勝ちです！");
        return true;
    }
    if (deck.length === 0 && player.hand.length === 0) {
        showGameOver("山札がなくなり、引き分けです。");
        return true;
    }
    return false;
}

function showGameOver(message) {
    gameOverMessageEl.textContent = message;
    gameOverModal.classList.remove('hidden');
}


// =============================
// UI関連
// =============================

// UI全体を更新
function updateUI() {
    // ステータス表示
    playerHpEl.textContent = Math.max(0, player.hp);
    playerMpEl.textContent = player.mp;
    cpuHpEl.textContent = Math.max(0, cpu.hp);
    cpuMpEl.textContent = cpu.mp;

    // 山札・捨て札枚数
    deckCountEl.textContent = deck.length;
    discardCountEl.textContent = discardPile.length;
    
    // 手札表示
    renderPlayerHand();
    renderCpuHand();
}

// プレイヤーの手札を描画
function renderPlayerHand() {
    playerHandEl.innerHTML = '';
    player.hand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        if (player.mp < card.cost || !isPlayerTurn || cardUsedThisTurn) {
            cardEl.classList.add('disabled');
        }
        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-effect">${card.effect}</div>
            <div class="card-cost">MP: ${card.cost}</div>
        `;
        cardEl.addEventListener('click', () => {
            if (isPlayerTurn && !cardUsedThisTurn && player.mp >= card.cost) {
                playCard(card, player, cpu);
            }
        });
        playerHandEl.appendChild(cardEl);
    });
}

// CPUの手札を描画（裏向き）
function renderCpuHand() {
    cpuHandEl.innerHTML = '';
    for (let i = 0; i < cpu.hand.length; i++) {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card', 'cpu-card');
        cpuHandEl.appendChild(cardEl);
    }
}

// メッセージを設定
function setMessage(text) {
    messageAreaEl.textContent = text;
}


// =============================
// イベントリスナー
// =============================
endTurnButton.addEventListener('click', endTurn);
restartButton.addEventListener('click', initGame);

// ゲーム開始
window.addEventListener('DOMContentLoaded', initGame);