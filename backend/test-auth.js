const testAuth = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shop_name: "Test Shop",
                owner_name: "Test Owner",
                email: "test@example.com",
                password: "password123"
            })
        });

        const data = await response.json();
        console.log("Response:", data);

        // This should fail gracefully because PG is not connected
        if (data.success === false && data.message === 'Database connection not available') {
            console.log("SUCCESS: API correctly handled disconnected DB state.");
        } else {
            console.log("UNEXPECTED RESPONSE:", data);
        }
    } catch (error) {
        console.error("Test Error:", error);
    }
};

testAuth();
