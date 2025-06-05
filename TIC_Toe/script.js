// Tic-Tac-Toe AI Game with Minimax Algorithm
class TicTacToeAI {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X'; // Player is X, AI is O
        this.gameActive = true;
        this.difficulty = 'hard';
        this.scores = { player: 0, ai: 0, draw: 0 };
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadScores();
    }

    initializeGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateDisplay();
        this.updateTurnIndicator();
        this.hideWinningLine();
        
        // Clear all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        document.getElementById('gameMessage').textContent = 'Your turn! Choose a square 🎯';
    }

    setupEventListeners() {
        // Cell clicks
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        // Control buttons
        document.getElementById('newGame').addEventListener('click', () => this.initializeGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.initializeGame();
        });
        
        // Theme selector
        document.getElementById('theme').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => this.hideModal());
        document.getElementById('playAgain').addEventListener('click', () => {
            this.hideModal();
            this.initializeGame();
        });
        document.getElementById('changeDifficulty').addEventListener('click', () => {
            this.hideModal();
            document.getElementById('difficulty').focus();
        });

        // Close modal when clicking outside
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.hideModal();
            }
        });
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentPlayer !== 'X') {
            return;
        }

        this.makeMove(index, 'X');
        
        if (this.gameActive && this.currentPlayer === 'O') {
            this.showAIThinking();
            setTimeout(() => {
                this.makeAIMove();
                this.hideAIThinking();
            }, 800); // Delay for dramatic effect
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('taken');

        const result = this.checkGameEnd();
        if (result) {
            this.endGame(result);
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateTurnIndicator();
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
            default:
                move = this.getBestMove();
                break;
        }

        if (move !== -1) {
            this.makeMove(move, 'O');
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        const result = this.checkWinner(board);
        
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'draw') return 0;

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false, alpha, beta);
                    board[i] = '';
                    maxScore = Math.max(score, maxScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true, alpha, beta);
                    board[i] = '';
                    minScore = Math.min(score, minScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return minScore;
        }
    }

    checkGameEnd() {
        return this.checkWinner(this.board);
    }

    checkWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.winningPattern = pattern;
                return board[a];
            }
        }

        return board.includes('') ? null : 'draw';
    }

    endGame(result) {
        this.gameActive = false;
        
        if (result !== 'draw') {
            this.highlightWinningCells();
            this.showWinningLine();
        }

        // Update scores
        if (result === 'X') {
            this.scores.player++;
            this.showModal('🎉 Congratulations!', 'You won! Amazing job! 🏆', '🎉');
        } else if (result === 'O') {
            this.scores.ai++;
            this.showModal('🤖 AI Wins!', 'The AI got you this time! Try again? 🎯', '🤖');
        } else {
            this.scores.draw++;
            this.showModal('🤝 It\'s a Draw!', 'Great game! Nobody wins this round! 🤝', '🤝');
        }

        this.updateScoreDisplay();
        this.saveScores();
    }

    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                document.querySelector(`[data-index="${index}"]`).classList.add('winning');
            });
        }
    }

    showWinningLine() {
        if (!this.winningPattern) return;

        const line = document.getElementById('winningLine');
        const [a, b, c] = this.winningPattern;
        
        // Calculate line position and rotation
        const cells = document.querySelectorAll('.cell');
        const cellA = cells[a].getBoundingClientRect();
        const cellC = cells[c].getBoundingClientRect();
        const board = document.querySelector('.game-board').getBoundingClientRect();
        
        const centerA = {
            x: cellA.left + cellA.width / 2 - board.left,
            y: cellA.top + cellA.height / 2 - board.top
        };
        const centerC = {
            x: cellC.left + cellC.width / 2 - board.left,
            y: cellC.top + cellC.height / 2 - board.top
        };
        
        const length = Math.sqrt(Math.pow(centerC.x - centerA.x, 2) + Math.pow(centerC.y - centerA.y, 2));
        const angle = Math.atan2(centerC.y - centerA.y, centerC.x - centerA.x) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.height = '6px';
        line.style.left = `${centerA.x}px`;
        line.style.top = `${centerA.y - 3}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        line.classList.add('show');
    }

    hideWinningLine() {
        document.getElementById('winningLine').classList.remove('show');
    }

    showModal(title, message, icon) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modalIcon').textContent = icon;
        document.getElementById('gameModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('gameModal').style.display = 'none';
    }

    showAIThinking() {
        document.getElementById('gameMessage').textContent = 'AI is thinking... 🤔';
        document.querySelector('.ai-turn').classList.add('active', 'ai-thinking');
        document.querySelector('.player-turn').classList.remove('active');
    }

    hideAIThinking() {
        document.querySelector('.ai-turn').classList.remove('ai-thinking');
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        const playerTurn = document.querySelector('.player-turn');
        const aiTurn = document.querySelector('.ai-turn');
        
        if (this.currentPlayer === 'X') {
            playerTurn.classList.add('active');
            aiTurn.classList.remove('active');
            document.getElementById('gameMessage').textContent = 'Your turn! Choose a square 🎯';
        } else {
            playerTurn.classList.remove('active');
            aiTurn.classList.add('active');
            document.getElementById('gameMessage').textContent = 'AI\'s turn! 🤖';
        }
    }

    changeTheme(theme) {
        document.body.className = theme === 'default' ? '' : `theme-${theme}`;
        localStorage.setItem('ticTacToeTheme', theme);
    }

    updateDisplay() {
        // Update any display elements if needed
    }

    updateScoreDisplay() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('drawScore').textContent = this.scores.draw;
    }

    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }

    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }

        const savedTheme = localStorage.getItem('ticTacToeTheme');
        if (savedTheme) {
            document.getElementById('theme').value = savedTheme;
            this.changeTheme(savedTheme);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeAI();
});

// Add some fun sound effects (optional - requires audio files)
class SoundManager {
    constructor() {
        this.sounds = {
            move: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
            win: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(() => {
                // Ignore audio play errors (browser restrictions)
            });
        }
    }
}

// Initialize sound manager
const soundManager = new SoundManager();
