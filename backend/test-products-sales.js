const testProductsSales = async () => {
    try {
        console.log("Testing GET /api/v1/products without token...");
        const res1 = await fetch('http://localhost:5000/api/v1/products');
        const data1 = await res1.json();

        if (res1.status === 401 && data1.message === 'Authorization token missing or invalid') {
            console.log("SUCCESS: Products route is protected by auth middleware.");
        } else {
            console.log("FAILED: Products route not protected.", data1);
        }

        console.log("Testing POST /api/v1/sales/upload without token...");
        const res2 = await fetch('http://localhost:5000/api/v1/sales/upload', {
            method: 'POST'
        });
        const data2 = await res2.json();

        if (res2.status === 401 && data2.message === 'Authorization token missing or invalid') {
            console.log("SUCCESS: Sales upload route is protected by auth middleware.");
        } else {
            console.log("FAILED: Sales upload route not protected.", data2);
        }

    } catch (error) {
        console.error("Test Error:", error);
    }
};

testProductsSales();
