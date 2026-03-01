const testChatbot = async () => {
    try {
        console.log("Testing POST /api/v1/chat/message without token...");
        const res1 = await fetch('http://localhost:5000/api/v1/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello AI, any recent sales?', language: 'en' })
        });
        const data1 = await res1.json();

        if (res1.status === 401 && data1.message === 'Authorization token missing or invalid') {
            console.log("SUCCESS: Chat route is protected by auth middleware.");
        } else {
            console.log("FAILED: Chat route not protected.", data1);
        }

        console.log("Testing GET /api/v1/chat/history without token...");
        const res2 = await fetch('http://localhost:5000/api/v1/chat/history');
        const data2 = await res2.json();

        if (res2.status === 401 && data2.message === 'Authorization token missing or invalid') {
            console.log("SUCCESS: Chat history route is protected by auth middleware.");
        } else {
            console.log("FAILED: Chat history route not protected.", data2);
        }

    } catch (error) {
        console.error("Test Error:", error);
    }
};

testChatbot();
