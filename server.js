const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 캐시 저장소
let imageCache = {};

app.get('/api/task-data', (req, res) => {
    const startTime = Date.now();
    const { taskPath, outputPath } = req.query;
    console.log(`\n>>> [API] Task Data Request: ${taskPath}`);

    try {
        const imagesDir = path.join(taskPath, 'images');
        const labelsPath = path.join(taskPath, 'labels.json');
        const finalOutputPath = outputPath ? outputPath : path.join(taskPath, 'output');
        
        const resultNames = ['predict_result.json', 'result.json'];
        let resultPath = '';
        for (const name of resultNames) {
            const p = path.join(finalOutputPath, name);
            if (fs.existsSync(p)) { resultPath = p; break; }
        }
        const metricsPath = path.join(finalOutputPath, 'metrics.json');

        // 1. 이미지 목록 캐싱 처리
        let images = [];
        if (!imageCache[imagesDir]) {
            console.log(`[Cache Miss] Scanning images in: ${imagesDir}`);
            if (fs.existsSync(imagesDir)) {
                images = fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png|bmp)$/i.test(f));
                imageCache[imagesDir] = images;
            }
        } else {
            console.log(`[Cache Hit] Serving ${imageCache[imagesDir].length} images from memory`);
            images = imageCache[imagesDir];
        }

        // 2. JSON 데이터 읽기 (성능 측정)
        const t1 = Date.now();
        let gtData = null;
        if (fs.existsSync(labelsPath)) gtData = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
        
        let predData = null;
        if (resultPath) predData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));

        let metricsData = null;
        if (fs.existsSync(metricsPath)) metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        const t2 = Date.now();

        console.log(`[Stats] File IO: ${t2 - t1}ms | Total Time: ${Date.now() - startTime}ms`);

        res.json({
            images,
            gt: gtData,
            pred: predData,
            metrics: metricsData,
            serverStats: { totalTime: Date.now() - startTime, ioTime: t2 - t1 }
        });
    } catch (error) {
        console.error('!!! Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/image', (req, res) => {
    const { folderPath, fileName } = req.query;
    const filePath = path.join(folderPath, fileName);
    // 이미지 서빙 로그는 너무 많으므로 생략하되, 에러만 기록
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        console.error(`[404] Image missing: ${filePath}`);
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`\n================================================`);
    console.log(`  🚀 Performance Optimized Studio: http://localhost:${PORT}`);
    console.log(`================================================\n`);
});
