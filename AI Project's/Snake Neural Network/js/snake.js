// Snake Game Logic
class Snake {
    constructor(gridSize = 20, seed = 12345) {
        this.gridSize = gridSize;
        this.rng = new SeededRandom(seed);
        this.reset();
    }

    reset() {
        // Reset random generator
        this.rng.reset();

        // Initialize snake in the center
        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);

        this.body = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];

        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.score = 0;
        this.alive = true;
        this.stepsWithoutFood = 0;
        this.totalSteps = 0;
        this.maxStepsWithoutFood = 100; // Short leash - must find food quickly

        // Track movement towards fruit for fitness
        this.movedTowardsFruit = 0;
        this.movedAwayFromFruit = 0;

        // Spawn first fruit
        this.spawnFruit();
        this.lastDistanceToFruit = this.getDistanceToFruit();
    }

    spawnFruit() {
        // Get all empty cells
        const emptyCells = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const isSnake = this.body.some(seg => seg.x === x && seg.y === y);
                if (!isSnake) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length > 0) {
            const index = this.rng.nextInt(0, emptyCells.length);
            this.fruit = emptyCells[index];
        } else {
            // No empty cells - snake wins!
            this.fruit = null;
        }
    }

    setDirection(newDirection) {
        // Prevent 180-degree turns
        if (getOppositeDirection(this.direction) !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    update() {
        if (!this.alive) return false;

        this.direction = this.nextDirection;
        const head = this.body[0];
        const dirVec = DirectionVector[this.direction];

        // Calculate new head position
        const newHead = {
            x: head.x + dirVec.x,
            y: head.y + dirVec.y
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= this.gridSize ||
            newHead.y < 0 || newHead.y >= this.gridSize) {
            this.alive = false;
            return false;
        }

        // Check self collision (excluding tail since it will move)
        for (let i = 0; i < this.body.length - 1; i++) {
            if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
                this.alive = false;
                return false;
            }
        }

        // Move snake
        this.body.unshift(newHead);
        this.totalSteps++;
        this.stepsWithoutFood++;

        // Check fruit collision
        if (this.fruit && newHead.x === this.fruit.x && newHead.y === this.fruit.y) {
            this.score++;
            this.stepsWithoutFood = 0;
            this.spawnFruit();
            this.lastDistanceToFruit = this.getDistanceToFruit();
            // Don't remove tail - snake grows
        } else {
            // Remove tail
            this.body.pop();

            // Track if we moved towards or away from fruit
            const newDistance = this.getDistanceToFruit();
            if (newDistance < this.lastDistanceToFruit) {
                this.movedTowardsFruit++;
            } else if (newDistance > this.lastDistanceToFruit) {
                this.movedAwayFromFruit++;
            }
            this.lastDistanceToFruit = newDistance;
        }

        // Check for starvation (prevents infinite loops)
        // Allow more steps for longer snakes (they need more room to navigate)
        const allowedSteps = this.maxStepsWithoutFood + (this.score * 50);
        if (this.stepsWithoutFood >= allowedSteps) {
            this.alive = false;
            return false;
        }

        return true;
    }

    // Get inputs for neural network
    getNeuralInputs() {
        const head = this.body[0];
        const inputs = [];

        // 1-4: Distance to walls in 4 directions (normalized 0-1)
        inputs.push(head.y / this.gridSize);                           // Up
        inputs.push((this.gridSize - 1 - head.y) / this.gridSize);     // Down
        inputs.push(head.x / this.gridSize);                           // Left
        inputs.push((this.gridSize - 1 - head.x) / this.gridSize);     // Right

        // 5-6: Relative fruit position (normalized -1 to 1)
        if (this.fruit) {
            inputs.push((this.fruit.x - head.x) / this.gridSize);      // Fruit X relative
            inputs.push((this.fruit.y - head.y) / this.gridSize);      // Fruit Y relative
        } else {
            inputs.push(0);
            inputs.push(0);
        }

        // 7: Distance to body in current direction (normalized 0-1)
        const bodyDist = this.getDistanceToBodyInDirection(this.direction);
        inputs.push(bodyDist / this.gridSize);

        // 8: Current direction encoded (0-1 range)
        inputs.push(this.direction / 3);

        return inputs;
    }

    getDistanceToBodyInDirection(dir) {
        const head = this.body[0];
        const dirVec = DirectionVector[dir];
        let distance = 0;

        let x = head.x + dirVec.x;
        let y = head.y + dirVec.y;

        while (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            distance++;
            // Check if this position has body (skip head)
            for (let i = 1; i < this.body.length; i++) {
                if (this.body[i].x === x && this.body[i].y === y) {
                    return distance;
                }
            }
            x += dirVec.x;
            y += dirVec.y;
        }

        return this.gridSize; // No body found in this direction
    }

    // Manhattan distance to fruit
    getDistanceToFruit() {
        if (!this.fruit) return 0;
        const head = this.body[0];
        return Math.abs(head.x - this.fruit.x) + Math.abs(head.y - this.fruit.y);
    }

    // Calculate fitness for genetic algorithm
    getFitness() {
        // ONLY reward eating fruit - nothing else matters
        // Small efficiency bonus as tiebreaker (fewer steps = slightly better)
        const efficiency = this.score > 0 ? 0.1 / this.totalSteps : 0;
        return this.score + efficiency;
    }

    // Render the snake game
    render(ctx, canvasWidth, canvasHeight) {
        const cellWidth = canvasWidth / this.gridSize;
        const cellHeight = canvasHeight / this.gridSize;

        // Clear canvas
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, canvasHeight);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(canvasWidth, i * cellHeight);
            ctx.stroke();
        }

        // Draw fruit
        if (this.fruit) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(
                (this.fruit.x + 0.5) * cellWidth,
                (this.fruit.y + 0.5) * cellHeight,
                cellWidth * 0.4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Draw snake body
        this.body.forEach((segment, index) => {
            const isHead = index === 0;
            const brightness = 1 - (index / this.body.length) * 0.5;

            if (isHead) {
                ctx.fillStyle = this.alive ? '#4ecca3' : '#888';
            } else {
                const green = Math.floor(204 * brightness);
                const blue = Math.floor(163 * brightness);
                ctx.fillStyle = this.alive ? `rgb(78, ${green}, ${blue})` : '#666';
            }

            const padding = 1;
            ctx.fillRect(
                segment.x * cellWidth + padding,
                segment.y * cellHeight + padding,
                cellWidth - padding * 2,
                cellHeight - padding * 2
            );

            // Draw eyes on head
            if (isHead) {
                ctx.fillStyle = '#0a0a15';
                const eyeSize = cellWidth * 0.15;
                const eyeOffset = cellWidth * 0.25;
                const dirVec = DirectionVector[this.direction];

                let eye1X, eye1Y, eye2X, eye2Y;
                const centerX = (segment.x + 0.5) * cellWidth;
                const centerY = (segment.y + 0.5) * cellHeight;

                if (dirVec.x !== 0) {
                    // Horizontal movement
                    eye1X = centerX + dirVec.x * eyeOffset;
                    eye1Y = centerY - eyeOffset;
                    eye2X = centerX + dirVec.x * eyeOffset;
                    eye2Y = centerY + eyeOffset;
                } else {
                    // Vertical movement
                    eye1X = centerX - eyeOffset;
                    eye1Y = centerY + dirVec.y * eyeOffset;
                    eye2X = centerX + eyeOffset;
                    eye2Y = centerY + dirVec.y * eyeOffset;
                }

                ctx.beginPath();
                ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
                ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw score on canvas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px monospace';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.fillText(`Steps: ${this.totalSteps}`, 10, 35);
    }
}
