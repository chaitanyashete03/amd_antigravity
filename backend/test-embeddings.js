const EmbeddingService = require('./src/services/embeddingService');

const testEmbeddings = async () => {
    try {
        console.log("Testing local embedding generation...");
        console.log("Input: 'Apple iPhone 15 Pro. Category: Smartphones'");

        const start = Date.now();
        const vector = await EmbeddingService.generateEmbedding('Apple iPhone 15 Pro. Category: Smartphones');
        const end = Date.now();

        console.log(`Vector successfully generated in ${end - start}ms.`);
        console.log(`Vector dimensions: ${vector.length} (Expected 384)`);
        console.log(`Sample [0-4]:`, vector.slice(0, 5));

        if (vector.length === 384) {
            console.log("\n✅ SUCCESS: @xenova/transformers loaded and generated proper embedding dimensions.");
        } else {
            console.log("\n❌ FAILED: Vector length is incorrect.");
        }
    } catch (e) {
        console.error("Test failed to run:", e);
    }
};

testEmbeddings();
