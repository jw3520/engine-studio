// 데이터 처리를 전담하는 비동기 워커
self.onmessage = function(e) {
    const { type, data, modelType } = e.data;

    if (type === 'PROCESS_TASK_DATA') {
        const startTime = Date.now();
        const { gt, pred, images } = data;
        
        // 1. ID to Pure FileName Map 생성
        // pred.images에서 id를 키로, 순수 파일명을 값으로 하는 맵을 만듭니다.
        const idToPureName = {};
        if (pred && pred.images) {
            pred.images.forEach(img => {
                const pure = img.file_name.split(/[\\/]/).pop().toLowerCase();
                idToPureName[String(img.id)] = pure;
            });
        }

        // 2. Pred 데이터 인덱싱 (Pure FileName 기준)
        // 기존의 image_id 기반 인덱싱은 ID 체계가 꼬일 경우 잘못된 매칭을 유발할 수 있으므로,
        // 모든 매칭의 기준을 파일명(Pure Name)으로 통일합니다.
        const indexedPred = {};
        if (pred && pred.annotations) {
            pred.annotations.forEach(ann => {
                const pure = idToPureName[String(ann.image_id)];
                if (pure) {
                    if (!indexedPred[pure]) indexedPred[pure] = [];
                    indexedPred[pure].push(ann);
                }
            });
        }

        // 3. 유효 이미지 필터링 (결과가 존재하는 이미지들)
        const predNames = new Set(Object.values(idToPureName));
        const validImages = images.filter(img => {
            const pure = img.split(/[\\/]/).pop().toLowerCase();
            return predNames.has(pure);
        });

        // 결과가 없으면 전체 이미지 사용, 있으면 필터링된 이미지 사용
        const finalImages = validImages.length > 0 ? validImages : images;

        console.log(`[Worker] Processed ${finalImages.length} images. (Mapping via Filenames)`);

        self.postMessage({
            type: 'TASK_DATA_PROCESSED',
            indexedPred,
            finalImages,
            processTime: Date.now() - startTime
        });
    }
};
