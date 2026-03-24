// Use built-in fetch (available in Node 18+)
async function testAuth() {
    const loginRes = await fetch('http://localhost:4000/api/v1/user/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@campus.com', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login failed:', loginData);
        return;
    }
    
    const token = loginData.token;
    console.log('Login successful, token obtained.');
    
    const statsRes = await fetch('http://localhost:4000/api/v1/user/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statsData = await statsRes.json();
    if (statsRes.ok) {
        console.log('Stats fetch successful!');
        // console.log(JSON.stringify(statsData, null, 2));
    } else {
        console.error('Stats fetch failed:', statsRes.status, statsData);
    }
}

testAuth();
