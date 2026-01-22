// Genetic Algorithm for Neural Network Evolution
class Evolution {
    constructor(populationSize = 50, mutationRate = 0.05) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.generation = 1;
        this.bestFitness = 0;
        this.bestScore = 0;
        this.bestNetwork = null;
        this.population = [];
        this.rng = new SeededRandom(Date.now());

        // FIXED seed for game environment - ALL snakes face identical fruit sequence
        this.gameSeed = 12345;
    }

    // Initialize population with random networks
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const network = new NeuralNetwork();
            network.randomize(this.rng);
            this.population.push({
                network: network,
                snake: new Snake(20, this.gameSeed), // Same seed for ALL snakes
                fitness: 0,
                alive: true
            });
        }
    }

    // Reset all snakes for a new generation
    resetSnakes() {
        for (const individual of this.population) {
            individual.snake.reset();
            individual.fitness = 0;
            individual.alive = true;
        }
    }

    // Update all snakes in the population
    updatePopulation() {
        let aliveCount = 0;

        for (const individual of this.population) {
            if (!individual.alive) continue;

            const snake = individual.snake;
            const network = individual.network;

            // Get neural network inputs from snake
            const inputs = snake.getNeuralInputs();

            // Get neural network output (direction)
            const direction = network.predict(inputs);

            // Set snake direction
            snake.setDirection(direction);

            // Update snake
            if (!snake.update()) {
                individual.alive = false;
                individual.fitness = snake.getFitness();
            } else {
                aliveCount++;
            }
        }

        return aliveCount;
    }

    // Check if generation is complete (all snakes dead)
    isGenerationComplete() {
        return this.population.every(individual => !individual.alive);
    }

    // Evolve to next generation
    evolveNextGeneration() {
        // Calculate fitness for any remaining alive snakes
        for (const individual of this.population) {
            if (individual.fitness === 0) {
                individual.fitness = individual.snake.getFitness();
            }
        }

        // Sort by fitness (highest first)
        this.population.sort((a, b) => b.fitness - a.fitness);

        // Track best performer
        const currentBest = this.population[0];
        if (currentBest.fitness > this.bestFitness) {
            this.bestFitness = currentBest.fitness;
            this.bestNetwork = currentBest.network.clone();
        }
        if (currentBest.snake.score > this.bestScore) {
            this.bestScore = currentBest.snake.score;
        }

        // Create new population
        const newPopulation = [];

        // Elitism: Keep top 10% unchanged
        const eliteCount = Math.floor(this.populationSize * 0.1);
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push({
                network: this.population[i].network.clone(),
                snake: new Snake(20, this.gameSeed), // Same seed for ALL snakes
                fitness: 0,
                alive: true
            });
        }

        // Fill rest with crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Tournament selection for parents
            const parent1 = this.tournamentSelect();
            const parent2 = this.tournamentSelect();

            // Crossover
            const childGenome = this.crossover(
                parent1.network.getGenome(),
                parent2.network.getGenome()
            );

            // Mutation
            this.mutate(childGenome);

            // Create child network
            const childNetwork = new NeuralNetwork();
            childNetwork.setGenome(childGenome);

            newPopulation.push({
                network: childNetwork,
                snake: new Snake(20, this.gameSeed), // Same seed for ALL snakes
                fitness: 0,
                alive: true
            });
        }

        this.population = newPopulation;
        this.generation++;
    }

    // Tournament selection
    tournamentSelect(tournamentSize = 5) {
        let best = null;
        let bestFitness = -Infinity;

        for (let i = 0; i < tournamentSize; i++) {
            const index = this.rng.nextInt(0, this.population.length);
            const individual = this.population[index];
            if (individual.fitness > bestFitness) {
                bestFitness = individual.fitness;
                best = individual;
            }
        }

        return best;
    }

    // Single-point crossover
    crossover(genome1, genome2) {
        const crossoverPoint = this.rng.nextInt(0, genome1.length);
        const childGenome = [];

        for (let i = 0; i < genome1.length; i++) {
            if (i < crossoverPoint) {
                childGenome.push(genome1[i]);
            } else {
                childGenome.push(genome2[i]);
            }
        }

        return childGenome;
    }

    // Mutation
    mutate(genome) {
        for (let i = 0; i < genome.length; i++) {
            if (this.rng.next() < this.mutationRate) {
                // Add random noise
                genome[i] += this.rng.nextFloat(-0.5, 0.5);
            }
        }
    }

    // Get the best performing snake in current population
    getBestAlive() {
        let best = null;
        let bestScore = -1;

        for (const individual of this.population) {
            if (individual.alive && individual.snake.score > bestScore) {
                bestScore = individual.snake.score;
                best = individual;
            }
        }

        // If no one is alive, return the one with highest fitness
        if (!best) {
            this.population.sort((a, b) => b.fitness - a.fitness);
            best = this.population[0];
        }

        return best;
    }

    // Get statistics
    getStats() {
        const aliveCount = this.population.filter(ind => ind.alive).length;
        const bestAlive = this.getBestAlive();

        return {
            generation: this.generation,
            aliveCount: aliveCount,
            currentScore: bestAlive ? bestAlive.snake.score : 0,
            bestScore: this.bestScore,
            bestFitness: this.bestFitness
        };
    }
}
