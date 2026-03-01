const { pipeline } = require('@xenova/transformers');

class EmbeddingService {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            // Use dynamically imported pipeline to avoid blocking the main thread initialization excessively initially
            console.log(`Loading embedding model: ${this.model}...`);
            this.instance = await pipeline(this.task, this.model);
            console.log(`Model ${this.model} loaded successfully.`);
        }
        return this.instance;
    }

    /**
     * Generates a 384-dimensional vector embedding for the given text.
     * @param {string} text 
     * @returns {Promise<number[]>} Array of length 384
     */
    static async generateEmbedding(text) {
        try {
            const extractor = await this.getInstance();
            // Generate embeddings
            // pooling: 'mean' and normalize: true are standard for sentence embeddings
            const output = await extractor(text, { pooling: 'mean', normalize: true });

            // Extract the Float32Array and convert to standard JS array
            return Array.from(output.data);
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }
}

module.exports = EmbeddingService;
