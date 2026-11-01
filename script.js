// 考勤数据可视化工具

// 模拟数据 - 考勤记录
let attendanceData = [
    { id: 1, date: '2024-01-15', hours: 8, salary: 400, remark: '正常考勤' },
    { id: 2, date: '2024-01-16', hours: 8.5, salary: 425, remark: '加班半小时' },
    { id: 3, date: '2024-01-17', hours: 7.5, salary: 375, remark: '早退' },
    { id: 4, date: '2024-01-18', hours: 8, salary: 400, remark: '正常考勤' },
    { id: 5, date: '2024-01-19', hours: 9, salary: 450, remark: '全天加班' },
];

// 初始化图表
function initCharts() {
    // 条形图：工作时长
    const barCanvas = document.getElementById('bar-chart');
    const barCtx = barCanvas.getContext('2d');
    
    barCanvas.width = barCanvas.parentElement.clientWidth;
    barCanvas.height = 200;
    
    const maxHours = Math.max(...attendanceData.map(d => d.hours)) || 1;
    const barHeight = 30;
    const padding = 20;
    
    barCtx.clearRect(0, 0, barCanvas.width, barCanvas.height);
    
    attendanceData.forEach((record, index) => {
        const barWidth = (record.hours / maxHours) * (barCanvas.width - 100);
        const y = padding + index * (barHeight + 10);
        
        // 绘制背景
        barCtx.fillStyle = '#e0e0e0';
        barCtx.fillRect(50, y, barCanvas.width - 100, barHeight);
        
        // 绘制工作时长 bar
        barCtx.fillStyle = '#1a73e8';
        barCtx.fillRect(50, y, barWidth, barHeight);
        
        // 绘制文本
        barCtx.fillStyle = '#202124';
        barCtx.font = '14px Arial';
        barCtx.fillText(`${record.hours}小时`, 50, y + 20);
        barCtx.fillText(record.date, 50 + barWidth + 10, y + 20);
    });
    
    // 扇形图：薪资构成
    const pieCanvas = document.getElementById('pie-chart');
    const pieCtx = pieCanvas.getContext('2d');
    
    pieCanvas.width = pieCanvas.parentElement.clientWidth;
    pieCanvas.height = 200;
    
    const centerX = pieCanvas.width / 2;
    const centerY = pieCanvas.height / 2;
    const radius = Math.min(pieCanvas.width, pieCanvas.height) / 2 - 50;
    
    let startAngle = -0.5 * Math.PI;
    
    // 计算总薪资
    const totalSalary = attendanceData.reduce((sum, record) => sum + record.salary, 0);
    
    attendanceData.forEach((record, index) => {
        const sliceAngle = (record.salary / totalSalary) * 2 * Math.PI;
        
        pieCtx.fillStyle = index === 0 ? '#1a73e8' : '#ff8a80';
        pieCtx.beginPath();
        pieCtx.moveTo(centerX, centerY);
        pieCtx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        pieCtx.closePath();
        pieCtx.fill();
        
        startAngle += sliceAngle;
    });
    
    // 绘制中心文本
    pieCtx.fillStyle = '#202124';
    pieCtx.font = '16px Arial';
    pieCtx.textAlign = 'center';
    pieCtx.fillText(`${totalSalary}元`, centerX, centerY + 5);
}

// 渲染考勤记录表格
function renderRecords() {
    const tbody = document.getElementById('records-table');
    tbody.innerHTML = '';
    
    // 创建表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>日期</th>
            <th>工作时长</th>
            <th>薪资</th>
        </tr>
    `;
    tbody.parentElement.insertBefore(thead, tbody);
    
    // 创建表体
    const tbodyInner = document.createElement('tbody');
    attendanceData.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${record.hours}小时</td>
            <td>￥${record.salary}</td>
        `;
        tbodyInner.appendChild(tr);
    });
    tbody.parentElement.insertBefore(tbodyInner, tbody);
}

// 导航函数
function goToHome() {
    document.getElementById('home-page').classList.add('active');
    document.getElementById('edit-page').classList.remove('active');
    initCharts();
    renderRecords();
}
 
function goToEdit() {
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('edit-page').classList.add('active');
}

// 保存考勤记录
function saveRecord(e) {
    e.preventDefault();
    
    const record = {
        id: Date.now(),
        date: document.querySelector('input[type="date"]').value,
        hours: parseFloat(document.querySelector('input[type="number"]:nth-of-type(1)').value),
        salary: parseInt(document.querySelector('input[type="number"]:nth-of-type(2)').value),
        remark: document.querySelector('textarea').value
    };
    
    attendanceData.push(record);
    renderRecords();
    initCharts();
    clearForm();
    showStatus('记录保存成功！', 'success');
}

// 清空表单
function clearForm() {
    document.getElementById('attendance-form').reset();
    showStatus('');
}

// 显示状态消息
function showStatus(message, type = '') {
    const statusDiv = document.getElementById('form-status');
    if (type === 'success') {
        statusDiv.innerHTML = `<span style="color: #34a853;">${message}</span>`;
    } else {
        statusDiv.innerHTML = '';
    }
}

// 窗口resize时重新绘制图表
window.addEventListener('resize', () => {
    initCharts();
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderRecords();
    initCharts();
});