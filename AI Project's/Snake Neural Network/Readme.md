# Snake AI - Neural Network Visualization

A browser-based Snake game where AI learns to play through neuroevolution (genetic algorithms + neural networks). Watch the AI's "brain" in real-time as it figures out how to collect apples.

![Snake AI Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue)

## Features

- **Real-time Neural Network Visualization** - See neurons fire and connections light up as the AI thinks
- **Genetic Algorithm Evolution** - Population of 50 snakes evolves over generations
- **Deterministic Environment** - All snakes face identical fruit sequences for fair comparison
- **Speed Control** - Run at 1x to 100x speed to watch evolution unfold
- **Zero Dependencies** - Pure vanilla JavaScript, HTML & CSS

## How It Works

### Neural Network
- **8 Inputs**: Wall distances (4 directions), fruit position (x, y), body distance, current direction
- **12 Hidden Neurons**: ReLU activation
- **4 Outputs**: Up, Right, Down, Left (softmax)

### Evolution
1. 50 snakes play the same game (identical fruit spawns)
2. Fitness = number of apples eaten
3. Top performers are selected and bred
4. Offspring inherit mixed weights from parents
5. Random mutations introduce variation
6. Repeat for continuous improvement

### Why It Works
Since every snake faces the exact same fruit sequence, the neural network learns specific patterns:
- "At step 10, turn right to get the apple"
- "After eating apple #3, go up to find #4"

Over generations, successful move sequences get reinforced through selection.

## Usage

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. Watch the AI learn!

### Controls
| Control | Function |
|---------|----------|
| **Speed Slider** | Adjust simulation speed (1x - 100x) |
| **Pause** | Stop/resume training |
| **Show Best** | Watch the all-time best performer |
| **Reset** | Start fresh with new random networks |

## File Structure

```
snake-neural-network/
├── index.html          # Main page with canvases and controls
├── style.css           # Dark theme styling
├── README.md
└── js/
    ├── main.js         # Game loop and UI controls
    ├── snake.js        # Snake game logic
    ├── neural-network.js   # Feed-forward neural network
    ├── evolution.js    # Genetic algorithm
    ├── visualizer.js   # Neural network renderer
    └── utils.js        # Seeded RNG and helpers
```

## Tips for Watching Evolution

- **Generation 1-5**: Mostly random movement, occasional lucky apple
- **Generation 10-20**: Snakes start consistently finding first few apples
- **Generation 50+**: Efficient pathfinding emerges
- **Generation 100+**: Complex multi-apple strategies develop

Use the speed slider to fast-forward through early chaotic generations, then slow down to watch refined behavior.

## Technical Details

- **Population Size**: 50
- **Mutation Rate**: 5%
- **Selection**: Tournament selection (size 5)
- **Elitism**: Top 10% preserved unchanged
- **Crossover**: Single-point crossover of weight arrays
- **Grid Size**: 20x20
- **Starvation Limit**: 100 steps without food (prevents infinite loops)

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No build step or server required.

## License

MIT License - Feel free to use, modify, and share.

---

Made by Valinz using JavaScript, HTML & CSS

