console.log('axios是否加载成功:', typeof axios);

document.addEventListener('DOMContentLoaded', function () {
    // 移除input-text的input事件监听
    const inputText = document.getElementById('input-text');
    if (inputText) {
        // 移除原有的input事件监听
        // inputText.removeEventListener('input', processInput);
    } else {
        console.error('未找到id为input-text的元素');
    }

    const addButtons = document.querySelectorAll('.add-button');
    const svg = document.getElementById('branch-svg');
    let activeButtons = new Map(); // 用于存储每个按钮的分支状态

    // 为专家组合生成固定颜色
    const expertColors = {
        'A': '#800000', // 深红色
        'B': '#008080', // 深青色
        'C': '#000080', // 深蓝色
        'D': '#808000', // 橄榄色
        'E': '#800080', // 深紫色
        'F': '#008000', // 深绿色
        'G': '#FF极客', // 红色
        'H': '#00FF00', // 绿色
        'I': '#0000FF', // 蓝色
        'J': '#FFFF00', // 黄色
        'K': '#FF00FF', // 品红
        'L': '#00FFFF', // 青色
        'M': '#FFA500', // 橙色
        'N': '#800080', // 紫色
        'O': '#008000', // 深绿
        'P': '#800000', // 深红
        'Q': '#008080', // 深青
        'R': '#000080', // 海军蓝
        'S': '#808000', // 橄榄色
        'T': '#800080', // 深紫
        'U': '#008000', // 深绿
        'V': '#800000', // 深红
        'W': '#008080', // 深青
        'X': '#000080', // 海军蓝
        'Y': '#808000', // 橄榄色
        'Z': '#800080'  // 深紫
    };

    // 为专家组合设置颜色
    const expertCombinations = document.querySelectorAll('.token-list .token-table td:nth-child(2)');
    expertCombinations.forEach(cell => {
        const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
        if (expert && expertColors[expert]) {
            cell.style.color = expertColors[expert];
        }
    });

    // 为专家组合解释模块设置颜色
    const expertExplanationCombinations = document.querySelectorAll('.expert-explanation .token-table td:nth-child(1)');
    expertExplanationCombinations.forEach(cell => {
        const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
        if (expert && expertColors[expert]) {
            cell.style.color = expertColors[expert];
        }
    });

    // 生成0到300的随机数的函数
    function generateRandomNumber() {
        return Math.floor(Math.random() * 301); // 0到300的随机数
    }

    // 生成三个随机token的函数
    function generateRandomTokens() {
        const tokens = [];
        for (let i = 0; i < 3; i++) {
            tokens.push(`token${Math.floor(Math.random() * 101)}`); // 0到100的随机数
        }
        return `(${tokens.join(',')})`; // 返回三个token，用逗号分隔并括起来
    }

    // 更新专家组合解释模块的语义标注列
    const expertExplanationRows = document.querySelectorAll('.expert-explanation .token-table tbody tr');
    expertExplanationRows.forEach(row => {
        const semanticCell = row.querySelector('td:nth-child(2)');
        if (semanticCell) {
            const randomTokens = generateRandomTokens(); // 生成三个随机token
            semanticCell.innerHTML = `${semanticCell.textContent}<br>${randomTokens}`; // 在原有内容下方添加随机token
        }
    });

    // 更新专家组合分解模块的语义标注列
    const expertDecompositionRows = document.querySelectorAll('.expert-decomposition .token-table tbody tr');
    expertDecompositionRows.forEach(row => {
        const semanticCell = row.querySelector('td:nth-child(2)');
        if (semanticCell) {
            const randomTokens = generateRandomTokens(); // 生成三个随机token
            semanticCell.innerHTML = `${semanticCell.textContent}<br>${randomTokens}`; // 在原有内容下方添加随机token
        }
    });

    // 监听滚动事件，动态更新分支
    window.addEventListener('scroll', function () {
        // 清除所有分支路径
        svg.innerHTML = ''

        // 重新绘制所有分支
        activeButtons.forEach(({ experts, weights }, button) => {
            updateBranches(button, experts, weights);
        });
    });

    addButtons.forEach((button) => {
        button.addEventListener('click', function () {
            // 如果当前按钮已有分支，则清除该按钮的分支
            if (activeButtons.has(button)) {
                // 清除该按钮的分支
                const { paths, labels } = activeButtons.get(button);
                paths.forEach(path => path.remove());
                labels.forEach(label => label.remove());
                activeButtons.delete(button);

                // 恢复所有分支的样式
                activeButtons.forEach(({ paths }) => {
                    paths.forEach(path => {
                        path.setAttribute('style', path.getAttribute('data-original-style')); // 恢复原始样式
                    });
                });
                return;
            }

            // 淡化或虚化其他分支
            activeButtons.forEach(({ paths }) => {
                paths.forEach(path => {
                    // 保存原始样式
                    path.setAttribute('data-original-style', path.getAttribute('style'));
                    // 设置淡化或虚线样式
                    path.setAttribute('style', `${path.getAttribute('style')}; opacity: 0.3; stroke-dasharray: 5,5;`);
                });
            });

            // 随机激活圆圈
            document.querySelectorAll('.circle').forEach(circle => {
                if (Math.random() < 0.5) { // 50% 的概率激活
                    circle.classList.add('active');
                } else {
                    circle.classList.remove('active');
                }
            });

            // 生成3到5个随机权重，总和为1
            const activeWeights = generateRandomWeights(3 + Math.floor(Math.random() * 3));

            // 根据按钮所在的模块选择目标专家
            const parentModule = button.closest('.token-list, .expert-explanation');
            let experts = [];
            if (parentModule.classList.contains('token-list')) {
                // token列表模块指向专家组合解释模块，只选择前五个专家
                experts = ['A', 'B', 'C', 'D', 'E'];
            } else if (parentModule.classList.contains('expert-explanation')) {
                // 专家组合解释模块指向专家组合分解模块
                experts = ['A', 'B', 'C', 'D', 'E'];
            }
            const activeExperts = experts.sort(() => 0.5 - Math.random()).slice(0, activeWeights.length);

            // 绘制分支并存储路径和标签
            const paths = [];
            const labels = [];
            updateBranches(button, activeExperts, activeWeights, paths, labels);

            // 存储当前按钮的分支状态
            activeButtons.set(button, { experts: activeExperts, weights: activeWeights, paths, labels });
        });
    });

    // 更新分支的函数
    function updateBranches(button, experts, weights, paths = [], labels = []) {
        // 获取加号按钮的位置
        const buttonRect = button.getBoundingClientRect();
        const buttonX = buttonRect.left + buttonRect.width / 2;
        const buttonY = buttonRect.top + buttonRect.height / 2;

        // 根据按钮所在的模块选择目标ID前缀
        const parentModule = button.closest('.token-list, .expert-explanation');
        const targetPrefix = parentModule.classList.contains('token-list') ? 'expert-' : 'decomp-';

        // 获取当前按钮对应的专家组合（仅适用于专家组合解释模块）
        let currentExpert = null;
        if (parentModule.classList.contains('expert-explanation')) {
            const expertCell = button.closest('tr').querySelector('td:nth-child(1)');
            currentExpert = expertCell.textContent.match(/专家组合(\w)/)?.[1];
            console.log('Current Expert:', currentExpert); // 添加调试信息
            console.log('Expert Colors:', expertColors); // 打印颜色映射
        }

        // 定义一组颜色，按顺序从上到下分配（仅用于一级专家组合的分解操作）
        const colors = [
            '#800000', // 深红色
            '#008080', // 深青色
            '#000080', // 深蓝色
            '#808000', // 橄榄色
            '#800080', // 深紫色
            '#008000', // 深绿色
            '#FF0000', // 红色
            '#00FF00', // 绿色
            '#0000FF', // 蓝色
            '#FFFF00', // 黄色
            '#FF00FF', // 品红
            '#00FFFF', // 青色
            '#FFA500', // 橙色
            '#800080', // 紫色
            '#008000', // 深绿
            '#800000', // 深红
            '#008080', // 深青
            '#000080', // 海军蓝
            '#808000', // 橄榄色
            '#800080', // 深紫
            '#008000', // 深绿
            '#800000', // 深红
            '#008080', // 深青
            '#000080', // 海军蓝
            '#808000', // 橄榄色
            '#800080'  // 深紫
        ];

        // 获取当前按钮所在的行索引（仅用于一级专家组合的分解操作）
        const rowIndex = Array.from(button.closest('tbody').children).indexOf(button.closest('tr'));

        // 绘制分支
        experts.forEach((expert, i) => {
            const expertDot = document.getElementById(`${targetPrefix}${expert}`);
            const expertRect = expertDot.getBoundingClientRect();
            const expertX = expertRect.left + expertRect.width / 2;
            const expertY = expertRect.top + expertRect.height / 2;

            // 获取专家组合的颜色
            let expertColor;
            if (parentModule.classList.contains('expert-explanation')) {
                expertColor = colors[rowIndex % colors.length];
            } else {
                expertColor = expertColors[expert];
            }

            // 绘制分支线
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M${buttonX},${buttonY} C${buttonX + 100},${buttonY} ${expertX - 100},${expertY} ${expertX},${expertY}`);
            path.setAttribute('class', 'branch');
            // 检查是否有原始样式，如果有则使用原始样式
            const originalStyle = path.getAttribute('data-original-style');
            if (originalStyle) {
                path.setAttribute('style', originalStyle);
            } else {
                path.setAttribute('style', `stroke: ${expertColor}; stroke-width: ${weights[i] * 10}px;`);
            }
            svg.appendChild(path);
            paths.push(path);
        });
    }

    // 生成随机权重，总和为1
    function generateRandomWeights(count) {
        const weights = [];
        let sum = 0;
        for (let i = 0; i < count; i++) {
            weights.push(Math.random());
            sum += weights[i];
        }
        return weights.map(w => w / sum);
    }

    // 为专家点添加点击染色功能
    document.querySelectorAll('.expert-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            dot.style.backgroundColor = dot.style.color;
        });
    });

    // 为专家组合编号添加点击染色功能
    document.querySelectorAll('.expert-explanation .token-table td:nth-child(1)').forEach(cell => {
        cell.addEventListener('click', () => {
            const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
            if (expert && expertColors[expert]) {
                cell.style.color = expertColors[expert];
            }
        });
    });

    // 绑定"编辑"按钮的点击事件
    const decomposeButton = document.getElementById('decompose-button');
    if (decomposeButton) {
        console.log('decompose-button found');
        decomposeButton.addEventListener('click', function() {
            console.log('decompose-button clicked');
            // 处理点击事件
        });
    } else {
        console.error('decompose-button not found');
    }

    // 绑定确认按钮的点击事件
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.addEventListener('click', processInput);
    } else {
        console.error('未找到id为confirm-button的元素');
    }

    const moeNetwork = document.getElementById('moe-network');
    const rows = 64; // 每列64个圆圈
    const cols = 27; // 共27列

    // 清空现有的内容
    moeNetwork.innerHTML = '';

    // 动态生成64x27的圆圈
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            moeNetwork.appendChild(circle);
        }
    }

    const tokenTableBody = document.querySelector('.token-table tbody');
    tokenTableBody.innerHTML = ''; // 清空token列表

    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
        });
    }
});

// 发送用户输入到后端并展示结果
async function processInput() {
    const inputText = document.getElementById('input-text').value;
    console.log('输入文本:', inputText); // 调试信息

    try {
        console.log('发送请求到后端'); // 调试信息
        const response = await axios.post('http://localhost:3000/api/process', { input: inputText }, {
            headers: {
                'Content-Type': 'application/json' // 设置请求头
            }
        });
        console.log('后端返回的数据:', response.data); // 调试信息

        const tokenVectors = response.data.tokenVectors;
        if (!tokenVectors || !Array.isArray(tokenVectors)) {
            console.error('tokenVectors 不是数组或未定义:', tokenVectors);
            return;
        }

        console.log('tokenVectors 数据:', tokenVectors); // 调试信息

        // 显示token列表
        displayTokenList(tokenVectors);
        console.log('displayTokenList 函数被调用'); // 调试信息

        // 显示一级专家组合
        displayTop5Experts(response.data.top5Experts);
        console.log('displayTop5Experts 函数被调用'); // 调试信息

        // 显示二级专家组合
        displaySecondLevelExperts(response.data.secondLevelExperts);
        console.log('displaySecondLevelExperts 函数被调用'); // 调试信息
    } catch (error) {
        console.error('请求失败:', error);
    }
}

// 为按钮添加点击事件
function displayTokenList(tokenVectors) {
    const tokenTableBody = document.querySelector('.token-table tbody');
    if (!tokenTableBody) {
        console.error('未找到token表格的tbody元素');
        return;
    }

    // 清空现有的内容
    tokenTableBody.innerHTML = '';

    // 遍历tokenVectors，生成每一行的内容
    tokenVectors.forEach(tokenVector => {
        const row = document.createElement('tr');

        // 创建Token单元格
        const tokenCell = document.createElement('td');
        tokenCell.textContent = tokenVector.token;
        row.appendChild(tokenCell);

        // 创建按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '+'; // 按钮文本
        button.classList.add('add-button'); // 添加按钮样式类

        // 保存激活向量到按钮的 data 属性
        button.dataset.activationVector = JSON.stringify(tokenVector.vector);

        button.addEventListener('click', async () => {
            console.log('按钮被点击，token:', tokenVector.token); // 调试信息
            console.log('激活向量:', JSON.parse(button.dataset.activationVector)); // 输出激活向量

            try {
                // 从按钮的 data 属性中获取激活向量
                const activationVector = JSON.parse(button.dataset.activationVector);

                // 发送请求查询Top 5专家
                const response = await axios.post('http://localhost:3000/api/top5-experts', {
                    tokenVector: activationVector
                });
                console.log('Top 5专家:', response.data); // 调试信息

                // 显示Top 5专家
                displayTop5Experts(response.data);

                // 随机点亮圆圈
                randomActivateCircles();

                // 高亮当前行和按钮
                const row = button.closest('tr');
                highlightRowAndButton(row, button, 'token');
            } catch (error) {
                console.error('查询Top 5专家失败:', error);
            }
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        // 将行添加到表格中
        tokenTableBody.appendChild(row);
    });
}

// 显示Top 5专家
function displayTop5Experts(top5Experts) {
    const expertTableBody = document.querySelector('.expert-explanation .token-table tbody');
    if (!expertTableBody) {
        console.error('未找到一级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    expertTableBody.innerHTML = '';

    // 遍历Top 5专家，生成每一行的内容
    top5Experts.forEach(expert => {
        const row = document.createElement('tr');

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert['Expert Index'];
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert['Expert Name'];
        const descDiv = document.createElement('div');
        descDiv.textContent = expert['Function Description'];
        descDiv.style.fontSize = '12px'; // 设置功能描述字体大小
        descDiv.style.color = '#666'; // 设置功能描述颜色
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        row.appendChild(infoCell);

        // 创建"分解"按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '+'; // 按钮文本
        button.classList.add('add-button'); // 添加按钮样式类
        button.addEventListener('click', async () => {
            console.log('分解按钮被点击，专家:', expert['Expert Name']); // 调试信息

            // 生成64维随机向量
            const randomVector = Array.from({ length: 64 }, () => Math.random());
            console.log('生成的64维随机向量:', randomVector); // 调试信息

            try {
                // 发送请求查询Top 5二级专家组合
                const response = await axios.post('http://localhost:3000/api/top5-second-level-experts', {
                    tokenVector: randomVector
                });
                console.log('Top 5二级专家组合:', response.data); // 调试信息

                // 显示Top 5二级专家组合
                displaySecondLevelExperts(response.data);

                // 随机点亮圆圈
                randomActivateCircles();

                // 高亮当前行和按钮
                const row = button.closest('tr');
                highlightRowAndButton(row, button, 'expert');
            } catch (error) {
                console.error('查询Top 5二级专家组合失败:', error);
            }
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        // 将行添加到表格中
        expertTableBody.appendChild(row);
    });
}

// 随机点亮圆圈
function randomActivateCircles() {
    const moeNetwork = document.getElementById('moe-network');
    const circles = moeNetwork.querySelectorAll('.circle');

    // 随机点亮圆圈
    circles.forEach(circle => {
        if (Math.random() < 0.5) { // 50% 的概率激活
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    });
}

// 显示二级专家组合
function displaySecondLevelExperts(secondLevelExperts) {
    const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
    if (!secondLevelTableBody) {
        console.error('未找到二级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    secondLevelTableBody.innerHTML = '';

    // 遍历二级专家组合，生成每一行的内容
    secondLevelExperts.forEach(expert => {
        const row = document.createElement('tr');

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert['Expert Index'];
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert['Expert Name'];
        const descDiv = document.createElement('div');
        descDiv.textContent = expert['Function Description'];
        descDiv.style.fontSize = '12px'; // 设置功能描述字体大小
        descDiv.style.color = '#666'; // 设置功能描述颜色
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        row.appendChild(infoCell);

        // 将行添加到表格中
        secondLevelTableBody.appendChild(row);
    });
}

// 更新token列表
function updateTokenList(tokenVectors) {
    const tokenTableBody = document.querySelector('.token-list .token-table tbody');
    tokenTableBody.innerHTML = tokenVectors
        .map(({ token }) => `
            <tr>
                <td>${token}</td>
                <td><button class="add-button">+</button></td>
            </tr>
        `)
        .join('');
}

let lastHighlightedRow = null;
let lastHighlightedButton = null;
let lastHighlightedColumn = null;

// 高亮行和按钮
function highlightRowAndButton(row, button, column) {
    // 如果之前有高亮的行和按钮，且点击的是同一列，去除背景和按钮颜色
    if (lastHighlightedRow && lastHighlightedColumn === column) {
        lastHighlightedRow.style.backgroundColor = '';
        lastHighlightedButton.style.backgroundColor = '';
    }

    // 如果之前有高亮的按钮，且点击的是不同列，复原按钮
    if (lastHighlightedButton && lastHighlightedColumn !== column) {
        lastHighlightedButton.style.backgroundColor = '';
    }

    // 高亮当前行和按钮
    row.style.backgroundColor = '#ADD8E6'; // 浅蓝色
    button.style.backgroundColor = '#ADD8E6'; // 浅蓝色

    // 更新最后高亮的行、按钮和列
    lastHighlightedRow = row;
    lastHighlightedButton = button;
    lastHighlightedColumn = column;
} 