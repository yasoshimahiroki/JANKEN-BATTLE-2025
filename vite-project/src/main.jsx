let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let streak = 0;
let isPlaying = false;

const choices = {
    rock: '✊',
    scissors: '✌️',
    paper: '✋'
};

const winConditions = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
};

const resultMessages = {
    win: ['Victory! 🎉', 'You Win! ⚡', 'Excellent! 🌟'],
    lose: ['Defeated 💀', 'You Lose 😢', 'Try Again 🎮'],
    draw: ['Draw! 🤝', 'Tie Game! ⚖️', 'Even Match! 🔄']
};

function getRandomMessage(type) {
    const messages = resultMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getComputerChoice() {
    const choices = ['rock', 'scissors', 'paper'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(player, computer) {
    if (player === computer) return 'draw';
    return winConditions[player] === computer ? 'win' : 'lose';
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('drawScore').textContent = drawScore;
}

function updateStreak(won) {
    const streakBadge = document.getElementById('streakBadge');
    const streakCount = document.getElementById('streakCount');
    
    if (won) {
        streak++;
        if (streak >= 2) {
            streakBadge.classList.add('show');
            streakCount.textContent = streak;
        }
    } else {
        streak = 0;
        streakBadge.classList.remove('show');
    }
}

function showResult(result) {
    const resultArea = document.getElementById('resultArea');
    const resultMessage = document.getElementById('resultMessage');
    
    resultArea.style.display = 'block';
    resultMessage.className = 'result ' + result;
    resultMessage.textContent = getRandomMessage(result);
    
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        resultMessage.classList.add('show');
    });
    
    if (result === 'win') {
        playerScore++;
        updateStreak(true);
    } else if (result === 'lose') {
        computerScore++;
        updateStreak(false);
    } else {
        drawScore++;
        updateStreak(false);
    }
    
    updateScores();
    
    setTimeout(() => {
        isPlaying = false;
    }, 1500);
}

function playGame(playerChoice) {
    if (isPlaying) return;
    isPlaying = true;

    const computerChoice = getComputerChoice();
    const battleArea = document.getElementById('battleArea');
    const playerChoiceElem = document.getElementById('playerChoice');
    const computerChoiceElem = document.getElementById('computerChoice');
    const vsText = document.getElementById('vsText');
    const resultArea = document.getElementById('resultArea');
    const resultMessage = document.getElementById('resultMessage');
    
    // Reset
    resultArea.style.display = 'none';
    resultMessage.classList.remove('show');
    battleArea.classList.remove('show');
    playerChoiceElem.classList.remove('show');
    computerChoiceElem.classList.remove('show');
    vsText.classList.remove('show');
    
    // Set choices
    document.getElementById('playerDisplay').textContent = choices[playerChoice];
    document.getElementById('computerDisplay').textContent = choices[computerChoice];
    
    // Show battle area with staggered animations
    requestAnimationFrame(() => {
        battleArea.classList.add('show');
        
        setTimeout(() => playerChoiceElem.classList.add('show'), 100);
        setTimeout(() => vsText.classList.add('show'), 200);
        setTimeout(() => computerChoiceElem.classList.add('show'), 300);
        
        setTimeout(() => {
            const result = determineWinner(playerChoice, computerChoice);
            showResult(result);
        }, 800);
    });
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    streak = 0;
    updateScores();
    
    document.getElementById('battleArea').classList.remove('show');
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('streakBadge').classList.remove('show');
}

// Event listeners
document.querySelectorAll('.choice-btn').forEach(button => {
    button.addEventListener('click', function() {
        playGame(this.dataset.choice);
    });
});

// `resetGame` was inlined in the HTML, so let's attach it here
document.getElementById('resetButton').addEventListener('click', resetGame);

// Keyboard support
document.addEventListener('keydown', function(e) {
    if (isPlaying) return;
    
    const keyMap = {
        '1': 'rock', 'r': 'rock',
        '2': 'scissors', 's': 'scissors',
        '3': 'paper', 'p': 'paper'
    };
    
    const choice = keyMap[e.key.toLowerCase()];
    if (choice) playGame(choice);
});