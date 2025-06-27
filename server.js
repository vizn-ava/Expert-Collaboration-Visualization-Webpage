const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 读取CSV文件
const experts = [];
fs.createReadStream('experts_summary.csv')
    .pipe(csv())
    .on('data', (row) => {
        experts.push(row);
    })
    .on('end', () => {
        console.log('CSV文件已加载');
    });

// 计算激活值
function calculateActivationScore(tokenVector, expertIndex) {
    // 这里可以根据 expertIndex 计算激活值
    // 例如：使用 expertIndex 作为随机种子生成激活值
    let score = 0;
    for (let i = 0; i < tokenVector.length; i++) {
        score += parseFloat(tokenVector[i]) * (Math.random() * 2 - 1); // 随机生成激活值
    }
    return score;
}

// 查询Top 5专家
function getTop5Experts(tokenVector) {
    // 将激活向量转换为专家索引和值的数组
    const expertScores = tokenVector
        .map((value, index) => ({ index, value })) // 将值和索引配对
        .filter(({ value }) => value > 0) // 过滤掉值为0的项
        .sort((a, b) => b.value - a.value); // 按值从高到低排序

    // 获取前5个专家的索引
    const top5Indices = expertScores.slice(0, 5).map(({ index }) => index);

    // 根据索引获取专家信息
    const top5Experts = top5Indices.map(index => {
        const expert = experts.find(e => e['Expert Index'] == index);
        return expert ? expert : { 'Expert Index': index, 'Expert Name': 'Unknown', 'Function Description': 'No description available' };
    });

    // 返回结果
    return top5Experts;
}

// API端点：查询Top 5专家
app.post('/api/top5-experts', (req, res) => {
    const { tokenVector } = req.body;
    if (!tokenVector || !Array.isArray(tokenVector)) {
        return res.status(400).json({ error: 'tokenVector 不能为空且必须为数组' });
    }

    // 查询Top 5专家
    const top5Experts = getTop5Experts(tokenVector);

    // 返回结果
    res.json(top5Experts);
});

// 模拟生成64维向量
function generate64DVector() {
    return Array.from({ length: 64 }, () => Math.random().toFixed(4)); // 生成64个随机数
}

// 处理输入的函数
function processInput(input) {
    // 示例句子及其对应的激活向量
    const exampleTokens = {
        'The': [3, 11, 12, 35, 40],
        'algorithm': [2, 25, 45, 57, 62],
        'processes': [6, 7, 42, 58, 39],
        'noisy': [4, 15, 21, 38, 52],
        'data': [8, 19, 20, 45, 53],
        '@2024': [16, 27, 34, 47, 59],
        'efficiently': [3, 39, 58, 35, 40]
    };

    // 按空格分解为token
    const tokens = input.split(' ');

    // 为每个token生成64维向量
    const tokenVectors = tokens.map(token => {
        if (exampleTokens[token]) {
            // 如果token在示例句子中，生成对应的固定激活向量
            return {
                token,
                vector: generateActivationVector(exampleTokens[token])
            };
        } else {
            // 如果token不在示例句子中，生成随机64维向量
            return {
                token,
                vector: Array.from({ length: 64 }, () => Math.random().toFixed(4)) // 64维向量
            };
        }
    });

    return { tokenVectors };
}

// 生成指定位置的激活向量，数字依次递减
function generateActivationVector(activeIndices) {
    const vector = Array(64).fill(0); // 初始化64维向量，全部为0
    let value = activeIndices.length; // 初始值
    activeIndices.forEach(index => {
        if (index >= 0 && index < 64) {
            vector[index] = value; // 在指定位置设置值
            value--; // 值递减
        }
    });
    return vector;
}

// API端点：接收前端发送的数据并返回处理结果
app.post('/api/process', (req, res) => {
    const { input } = req.body; // 获取前端发送的输入数据
    if (!input) {
        return res.status(400).json({ error: '输入数据不能为空' });
    }

    // 处理数据
    const result = processInput(input);

    // 返回处理结果
    res.json(result);
});

// 假设你有一个函数 generateTokenList，用于生成token列表
function generateTokenList(inputText) {
    // 这里可以根据输入文本生成多个token
    // 例如，将输入文本按空格分割成多个token
    const tokens = inputText.split(' ').map((token, index) => ({
        token: token,
        vector: Array(64).fill(Math.random().toFixed(4)) // 随机生成64维向量
    }));
    return tokens;
}

// 添加一个新的路由，专门返回token列表
app.post('/api/token-list', (req, res) => {
    const inputText = req.body.text;
    if (!inputText) {
        return res.status(400).json({ error: '输入文本不能为空' });
    }

    // 生成token列表
    const tokenList = generateTokenList(inputText);
    res.json({ tokenVectors: tokenList });
});

// 为根路径添加响应
app.get('/', (req, res) => {
    res.send('后端服务已启动，请使用 /api/process 端点处理数据');
});

// API端点：查询第二类专家组合
app.post('/api/second-level-experts', (req, res) => {
    const { expertIndex } = req.body;
    if (!expertIndex) {
        return res.status(400).json({ error: 'expertIndex 不能为空' });
    }

    // 这里可以根据 expertIndex 查询第二类专家组合
    // 例如：随机生成一些第二类专家组合
    const secondLevelExperts = [
        { 'Expert Index': '2-1', 'Expert Name': 'Second Expert A', 'Function Description': '功能描述A' },
        { 'Expert Index': '2-2', 'Expert Name': 'Second Expert B', 'Function Description': '功能描述B' },
        { 'Expert Index': '2-3', 'Expert Name': 'Second Expert C', 'Function Description': '功能描述C' }
    ];

    // 返回结果
    res.json(secondLevelExperts);
});

app.use(express.static('public')); // 确保静态文件目录正确配置

// 启动服务器
app.listen(port, () => {
    console.log(`后端服务已启动，运行在 http://localhost:${port}`);
});
