
export interface TrainingInput {
    sugar?: number;
    bp?: number;
  }
  
  export interface TrainingOutput {
    [category: string]: number; // e.g. { low_carb: 1 }
  }
  
  export interface TrainingSample {
    input: TrainingInput;
    output: TrainingOutput;
  }
  
  export class NeuralNetwork {
    trainingData: TrainingSample[] = [];
  
    constructor() {
      this.trainingData = [];
    }
  
    // Train the model with data samples
    train(data: TrainingSample[]) {
      console.log("🧠 ML Model: Starting Training Process...");
      console.log(`🧠 ML Model: Learned from ${data.length} clinical samples.`);
      this.trainingData = data;
      return { error: 0.005, iterations: 1000 }; // Simulated training stats
    }
  
    // Run prediction on new input
    run(input: TrainingInput): TrainingOutput {
      console.log("🧠 ML Model: Analyzing Input:", input);
      
      let bestMatch: TrainingOutput | null = null;
      let closestDistance = Infinity;
  
      // Find the closest matching case from our training data (Nearest Neighbor)
      for (const sample of this.trainingData) {
        const distance = this.calculateDistance(input, sample.input);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          bestMatch = sample.output;
        }
      }
  
      return bestMatch || {};
    }
  
    // Euclidean distance helper
    private calculateDistance(inputA: TrainingInput, inputB: TrainingInput): number {
      const sugarDiff = (inputA.sugar || 0) - (inputB.sugar || 0);
      const bpDiff = (inputA.bp || 0) - (inputB.bp || 0);
      return Math.sqrt((sugarDiff * sugarDiff) + (bpDiff * bpDiff));
    }
  }