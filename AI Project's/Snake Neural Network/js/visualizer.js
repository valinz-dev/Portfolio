// Neural Network Visualizer
class NeuralNetworkVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Input labels
        this.inputLabels = [
            'Wall Up',
            'Wall Down',
            'Wall Left',
            'Wall Right',
            'Fruit X',
            'Fruit Y',
            'Body Dist',
            'Direction'
        ];

        // Output labels
        this.outputLabels = ['Up', 'Right', 'Down', 'Left'];

        // Visual settings
        this.nodeRadius = 15;
        this.layerSpacing = 150;
        this.padding = 50;
    }

    render(network) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, width, height);

        // Calculate layer positions
        const inputX = this.padding + 60;
        const hiddenX = width / 2;
        const outputX = width - this.padding - 40;

        // Calculate node positions
        const inputNodes = this.calculateNodePositions(network.inputSize, inputX, height);
        const hiddenNodes = this.calculateNodePositions(network.hiddenSize, hiddenX, height);
        const outputNodes = this.calculateNodePositions(network.outputSize, outputX, height);

        // Draw connections (input -> hidden)
        this.drawConnections(
            ctx, inputNodes, hiddenNodes,
            network.weightsInputHidden,
            network.inputActivations
        );

        // Draw connections (hidden -> output)
        this.drawConnections(
            ctx, hiddenNodes, outputNodes,
            network.weightsHiddenOutput,
            network.hiddenActivations
        );

        // Draw nodes
        this.drawNodes(ctx, inputNodes, network.inputActivations, this.inputLabels, 'left');
        this.drawNodes(ctx, hiddenNodes, network.hiddenActivations, null, 'center');
        this.drawNodes(ctx, outputNodes, network.outputActivations, this.outputLabels, 'right');

        // Draw layer labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INPUT', inputX, 25);
        ctx.fillText('HIDDEN', hiddenX, 25);
        ctx.fillText('OUTPUT', outputX, 25);
    }

    calculateNodePositions(count, x, canvasHeight) {
        const positions = [];
        const spacing = (canvasHeight - this.padding * 2) / (count + 1);

        for (let i = 0; i < count; i++) {
            positions.push({
                x: x,
                y: this.padding + spacing * (i + 1)
            });
        }

        return positions;
    }

    drawConnections(ctx, fromNodes, toNodes, weights, fromActivations) {
        for (let i = 0; i < fromNodes.length; i++) {
            for (let j = 0; j < toNodes.length; j++) {
                const weight = weights[i][j];
                const activation = fromActivations[i] || 0;

                // Skip very small weights for cleaner visualization
                if (Math.abs(weight) < 0.1) continue;

                // Calculate line properties based on weight
                const normalizedWeight = clamp(Math.abs(weight), 0, 2);
                const lineWidth = mapRange(normalizedWeight, 0, 2, 0.5, 3);

                // Color based on weight sign and activation
                const alpha = mapRange(Math.abs(activation * weight), 0, 1, 0.1, 0.8);

                if (weight >= 0) {
                    ctx.strokeStyle = `rgba(78, 204, 163, ${alpha})`;
                } else {
                    ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`;
                }

                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.moveTo(fromNodes[i].x + this.nodeRadius, fromNodes[i].y);
                ctx.lineTo(toNodes[j].x - this.nodeRadius, toNodes[j].y);
                ctx.stroke();
            }
        }
    }

    drawNodes(ctx, positions, activations, labels, labelSide) {
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const activation = activations[i] || 0;

            // Draw node glow based on activation
            if (activation > 0.1) {
                const gradient = ctx.createRadialGradient(
                    pos.x, pos.y, 0,
                    pos.x, pos.y, this.nodeRadius * 2
                );
                gradient.addColorStop(0, `rgba(78, 204, 163, ${activation * 0.5})`);
                gradient.addColorStop(1, 'rgba(78, 204, 163, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, this.nodeRadius * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw node circle
            const brightness = 0.3 + activation * 0.7;
            ctx.fillStyle = `rgb(${Math.floor(78 * brightness)}, ${Math.floor(204 * brightness)}, ${Math.floor(163 * brightness)})`;
            ctx.strokeStyle = '#4ecca3';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw activation value inside node
            ctx.fillStyle = activation > 0.5 ? '#0a0a15' : '#fff';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(activation.toFixed(2), pos.x, pos.y);

            // Draw label
            if (labels && labels[i]) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '10px monospace';
                ctx.textBaseline = 'middle';

                if (labelSide === 'left') {
                    ctx.textAlign = 'right';
                    ctx.fillText(labels[i], pos.x - this.nodeRadius - 8, pos.y);
                } else if (labelSide === 'right') {
                    ctx.textAlign = 'left';
                    ctx.fillText(labels[i], pos.x + this.nodeRadius + 8, pos.y);
                }
            }
        }
    }
}
