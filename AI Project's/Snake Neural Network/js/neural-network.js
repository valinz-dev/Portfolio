// Neural Network implementation for Snake AI
class NeuralNetwork {
    constructor(inputSize = 8, hiddenSize = 12, outputSize = 4) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        // Initialize weights and biases randomly
        this.weightsInputHidden = this.createMatrix(inputSize, hiddenSize);
        this.biasHidden = new Array(hiddenSize).fill(0);

        this.weightsHiddenOutput = this.createMatrix(hiddenSize, outputSize);
        this.biasOutput = new Array(outputSize).fill(0);

        // Store activations for visualization
        this.inputActivations = new Array(inputSize).fill(0);
        this.hiddenActivations = new Array(hiddenSize).fill(0);
        this.outputActivations = new Array(outputSize).fill(0);

        // Randomize initial weights
        this.randomize();
    }

    createMatrix(rows, cols) {
        return Array.from({ length: rows }, () => new Array(cols).fill(0));
    }

    randomize(rng = null) {
        const random = rng ? () => rng.nextFloat(-1, 1) : () => Math.random() * 2 - 1;

        // Xavier initialization for better training
        const inputScale = Math.sqrt(2 / this.inputSize);
        const hiddenScale = Math.sqrt(2 / this.hiddenSize);

        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsInputHidden[i][j] = random() * inputScale;
            }
        }

        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasHidden[i] = random() * 0.1;
            for (let j = 0; j < this.outputSize; j++) {
                this.weightsHiddenOutput[i][j] = random() * hiddenScale;
            }
        }

        for (let i = 0; i < this.outputSize; i++) {
            this.biasOutput[i] = random() * 0.1;
        }
    }

    // ReLU activation function
    relu(x) {
        return Math.max(0, x);
    }

    // Softmax activation function
    softmax(arr) {
        const maxVal = Math.max(...arr);
        const expValues = arr.map(x => Math.exp(x - maxVal));
        const sumExp = expValues.reduce((a, b) => a + b, 0);
        return expValues.map(x => x / sumExp);
    }

    // Forward propagation
    forward(inputs) {
        if (inputs.length !== this.inputSize) {
            throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
        }

        // Store input activations
        this.inputActivations = [...inputs];

        // Calculate hidden layer
        const hidden = new Array(this.hiddenSize).fill(0);
        for (let j = 0; j < this.hiddenSize; j++) {
            let sum = this.biasHidden[j];
            for (let i = 0; i < this.inputSize; i++) {
                sum += inputs[i] * this.weightsInputHidden[i][j];
            }
            hidden[j] = this.relu(sum);
        }
        this.hiddenActivations = hidden;

        // Calculate output layer
        const output = new Array(this.outputSize).fill(0);
        for (let j = 0; j < this.outputSize; j++) {
            let sum = this.biasOutput[j];
            for (let i = 0; i < this.hiddenSize; i++) {
                sum += hidden[i] * this.weightsHiddenOutput[i][j];
            }
            output[j] = sum;
        }

        // Apply softmax to output
        this.outputActivations = this.softmax(output);

        return this.outputActivations;
    }

    // Get the predicted action (index of highest output)
    predict(inputs) {
        const outputs = this.forward(inputs);
        let maxIndex = 0;
        let maxValue = outputs[0];
        for (let i = 1; i < outputs.length; i++) {
            if (outputs[i] > maxValue) {
                maxValue = outputs[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }

    // Clone this network
    clone() {
        const clone = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);

        // Deep copy weights and biases
        clone.weightsInputHidden = this.weightsInputHidden.map(row => [...row]);
        clone.biasHidden = [...this.biasHidden];
        clone.weightsHiddenOutput = this.weightsHiddenOutput.map(row => [...row]);
        clone.biasOutput = [...this.biasOutput];

        return clone;
    }

    // Get all weights and biases as a flat array
    getGenome() {
        const genome = [];

        // Input to hidden weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                genome.push(this.weightsInputHidden[i][j]);
            }
        }

        // Hidden biases
        genome.push(...this.biasHidden);

        // Hidden to output weights
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                genome.push(this.weightsHiddenOutput[i][j]);
            }
        }

        // Output biases
        genome.push(...this.biasOutput);

        return genome;
    }

    // Set weights and biases from a flat array
    setGenome(genome) {
        let index = 0;

        // Input to hidden weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsInputHidden[i][j] = genome[index++];
            }
        }

        // Hidden biases
        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasHidden[i] = genome[index++];
        }

        // Hidden to output weights
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                this.weightsHiddenOutput[i][j] = genome[index++];
            }
        }

        // Output biases
        for (let i = 0; i < this.outputSize; i++) {
            this.biasOutput[i] = genome[index++];
        }
    }

    // Get the total number of parameters
    getParameterCount() {
        return (this.inputSize * this.hiddenSize) + this.hiddenSize +
               (this.hiddenSize * this.outputSize) + this.outputSize;
    }
}
