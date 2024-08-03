const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'your-secret-key';  // 在實際應用中，這應該是一個環境變量

// 模擬用戶數據庫
const users = [
    {
        id: 1,
        username: 'admin',
        password: '$2b$10$Mj5XFEFyw5x9JJdoxZKXMO3tS3/v0Xrby6pFYIk7nEZtSPIZaF.jy' // 密碼: 1234
    }
];

// 登錄路由
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: '用戶名或密碼錯誤' });
    }
});

// 驗證中間件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// 受保護的路由示例
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: '這是受保護的數據', user: req.user });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));