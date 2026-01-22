// Main Entry Point - Game Loop and Controls
class SnakeAI {
    constructor() {
        // Get canvas elements
        this.gameCanvas = document.getElementById('game-canvas');
        this.gameCtx = this.gameCanvas.getContext('2d');
        this.nnCanvas = document.getElementById('nn-canvas');

        // Initialize components
        this.evolution = new Evolution(50, 0.05);
        this.visualizer = new NeuralNetworkVisualizer(this.nnCanvas);

        // Game state
        this.isPaused = false;
        this.showBest = false;
        this.speed = 10;
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameInterval = 1000 / 60; // Base 60 FPS

        // Currently displayed individual
        this.displayedIndividual = null;

        // UI Elements
        this.generationEl = document.getElementById('generation');
        this.bestScoreEl = document.getElementById('best-score');
        this.currentScoreEl = document.getElementById('current-score');
        this.aliveCountEl = document.getElementById('alive-count');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValueEl = document.getElementById('speed-value');
        this.pauseBtn = document.getElementById('pause-btn');
        this.showBestBtn = document.getElementById('show-best-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Bind event listeners
        this.bindEvents();

        // Initialize and start
        this.init();
    }

    bindEvents() {
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValueEl.textContent = `${this.speed}x`;
        });

        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.pauseBtn.textContent = this.isPaused ? 'Play' : 'Pause';
            this.pauseBtn.classList.toggle('paused', this.isPaused);
        });

        this.showBestBtn.addEventListener('click', () => {
            this.showBest = !this.showBest;
            this.showBestBtn.textContent = this.showBest ? 'Show Current' : 'Show Best';
            this.showBestBtn.classList.toggle('active', this.showBest);
        });

        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    init() {
        this.evolution.initializePopulation();
        this.displayedIndividual = this.evolution.getBestAlive();
        this.updateStats();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    reset() {
        this.evolution = new Evolution(50, 0.05);
        this.evolution.initializePopulation();
        this.displayedIndividual = this.evolution.getBestAlive();
        this.showBest = false;
        this.showBestBtn.textContent = 'Show Best';
        this.showBestBtn.classList.remove('active');
        this.updateStats();
    }

    gameLoop(currentTime) {
        requestAnimationFrame((time) => this.gameLoop(time));

        if (this.isPaused) {
            this.render();
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Run multiple simulation steps based on speed
        for (let i = 0; i < this.speed; i++) {
            this.update();
        }

        // Render at 60 FPS regardless of simulation speed
        this.render();
    }

    update() {
        // Update all snakes in population
        const aliveCount = this.evolution.updatePopulation();

        // Check if generation is complete
        if (this.evolution.isGenerationComplete()) {
            this.evolution.evolveNextGeneration();
        }

        // Update displayed individual
        if (this.showBest && this.evolution.bestNetwork) {
            // Create a demo snake with best network for display
            if (!this.demoSnake || !this.demoSnake.alive) {
                this.demoSnake = new Snake(20, this.evolution.gameSeed);
                this.demoNetwork = this.evolution.bestNetwork.clone();
            }

            const inputs = this.demoSnake.getNeuralInputs();
            const direction = this.demoNetwork.predict(inputs);
            this.demoSnake.setDirection(direction);
            this.demoSnake.update();

            this.displayedIndividual = {
                snake: this.demoSnake,
                network: this.demoNetwork
            };
        } else {
            this.displayedIndividual = this.evolution.getBestAlive();
        }
    }

    render() {
        // Render snake game
        if (this.displayedIndividual && this.displayedIndividual.snake) {
            this.displayedIndividual.snake.render(
                this.gameCtx,
                this.gameCanvas.width,
                this.gameCanvas.height
            );
        }

        // Render neural network visualization
        if (this.displayedIndividual && this.displayedIndividual.network) {
            this.visualizer.render(this.displayedIndividual.network);
        }

        // Update stats display
        this.updateStats();
    }

    updateStats() {
        const stats = this.evolution.getStats();

        this.generationEl.textContent = stats.generation;
        this.bestScoreEl.textContent = stats.bestScore;
        this.aliveCountEl.textContent = stats.aliveCount;

        if (this.displayedIndividual && this.displayedIndividual.snake) {
            this.currentScoreEl.textContent = this.displayedIndividual.snake.score;
        }
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.snakeAI = new SnakeAI();
});
