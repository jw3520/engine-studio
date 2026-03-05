const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// /test 경로로 접속해도 index.html을 서빙하도록 설정
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));

// 캐시 저장소
let imageCache = {};

app.get('/api/task-data', (req, res) => {
    const startTime = Date.now();
    let { taskPath, outputPath } = req.query;
    
    // 경로 정규화 및 정리
    taskPath = taskPath ? taskPath.trim() : "";
    outputPath = outputPath ? outputPath.trim() : "";

    console.log(`\n>>> [API] Task Data Request: "${taskPath}"`);

    if (!taskPath) {
        return res.status(400).json({ error: "Task Path가 비어있습니다." });
    }

    try {
        const imagesDir = path.join(taskPath, 'images');
        const labelsPath = path.join(taskPath, 'labels.json');
        
        // 1. Output 경로 자동 결정
        let finalOutputPath = "";
        if (outputPath) {
            finalOutputPath = outputPath;
        } else {
            // taskPath 하위에 output 폴더가 있는지 확인
            const possibleOutput = path.join(taskPath, 'output');
            if (fs.existsSync(possibleOutput)) {
                finalOutputPath = possibleOutput;
            } else {
                finalOutputPath = taskPath; // output 폴더가 없으면 현재 폴더에서 탐색
            }
        }
        console.log(`[Path] Using Output Dir: ${finalOutputPath}`);

        const resultNames = ['predict_result.json', 'result.json', 'predict_results.json'];
        let resultPath = '';
        for (const name of resultNames) {
            const p = path.join(finalOutputPath, name);
            if (fs.existsSync(p)) { resultPath = p; break; }
        }
        
        // 만약 output 하위에도 없다면 taskPath 바로 아래에서도 한 번 더 확인
        if (!resultPath && finalOutputPath !== taskPath) {
            for (const name of resultNames) {
                const p = path.join(taskPath, name);
                if (fs.existsSync(p)) { resultPath = p; break; }
            }
        }

        const metricsPath = path.join(finalOutputPath, 'metrics.json');

        // 2. 이미지 목록 스캔
        let images = [];
        if (fs.existsSync(imagesDir)) {
            if (!imageCache[imagesDir]) {
                console.log(`[Cache Miss] Scanning images in: ${imagesDir}`);
                images = fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png|bmp)$/i.test(f));
                imageCache[imagesDir] = images;
            } else {
                images = imageCache[imagesDir];
            }
        } else {
            console.warn(`[Warn] Images directory not found: ${imagesDir}`);
        }

        // 3. JSON 데이터 읽기
        const t1 = Date.now();
        let gtData = null;
        if (fs.existsSync(labelsPath)) gtData = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
        
        let predData = null;
        if (resultPath) {
            console.log(`[Found] Result file: ${resultPath}`);
            predData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        } else {
            console.warn(`[Warn] No prediction result files found in ${finalOutputPath}`);
        }

        let metricsData = null;
        if (fs.existsSync(metricsPath)) metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        const t2 = Date.now();

        console.log(`[Stats] Images: ${images.length} | File IO: ${t2 - t1}ms | Total: ${Date.now() - startTime}ms`);

        res.json({
            images,
            gt: gtData,
            pred: predData,
            metrics: metricsData,
            serverStats: { totalTime: Date.now() - startTime, ioTime: t2 - t1, resultPath }
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
