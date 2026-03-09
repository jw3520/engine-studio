const ModelRules = {
    "seg": {
        name: "SEG (Segmentation)",
        parseGT: (r) => {
            if (r.type === "RotatedRect") return ModelRules.ord.parseGT(r);
            return { points: r.points, type: 'polygon' };
        },
        parsePred: (ann) => {
            if (ann.obox) return ModelRules.ord.parsePred(ann);
            let seg = ann.segmentation;
            if (!seg) return null;
            let flat = Array.isArray(seg[0]) ? seg[0] : seg;
            if (flat.length < 6) return null;
            const pts = [];
            for (let i = 0; i < flat.length; i += 2) {
                pts.push([flat[i], flat[i+1]]);
            }
            return { points: pts, type: 'polygon' };
        }
    },
    "ord": {
        name: "ORD (Oriented Object Detection)",
        parseGT: (r) => {
            // ORD GT가 cx, cy 기반이 아닐 경우 seg 규칙 차용
            if (r.cx === undefined && r.points) return ModelRules.seg.parseGT(r);
            if (r.cx === undefined) return null;
            return { cx: r.cx, cy: r.cy, w: r.width, h: r.height, angle: r.angle, type: 'rotated_rect' };
        },
        parsePred: (ann) => {
            // ORD Pred가 obox가 아닌 segmentation으로 들어올 경우 대응
            if (!ann.obox && ann.segmentation) return ModelRules.seg.parsePred(ann);
            const d = ann.obox || ann.bbox;
            if (!d) return null;
            if (d.length >= 5) {
                return { cx: d[0], cy: d[1], w: d[2], h: d[3], angle: d[4], type: 'rotated_rect' };
            } else if (d.length === 4) {
                return { x: d[0], y: d[1], w: d[2], h: d[3], type: 'rect' };
            }
            return null;
        }
    },
    "rot": {
        name: "ROT (Rotation)",
        parseGT: (entry) => ({ 
            angle: entry.rotation_angle !== undefined ? entry.rotation_angle : (entry.angle !== undefined ? entry.angle : (parseFloat(entry.classLabel) || 0)), 
            type: 'rotation' 
        }),
        parsePred: (ann) => {
            let angle = ann.angle !== undefined ? ann.angle : 0;
            // 추론된 공식 적용: GT와 반대 방향 (360 - angle 또는 -angle)
            let transformed = -angle;
            // -180 ~ 180 범위로 정규화
            while (transformed > 180) transformed -= 360;
            while (transformed <= -180) transformed += 360;
            return { angle: transformed, type: 'rotation' };
        }
    }
};

function getRotatedRectPoints(cx, cy, w, h, angleDeg) {
    const rad = -angleDeg * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = w / 2;
    const dy = h / 2;
    const corners = [{x: -dx, y: -dy}, {x: dx, y: -dy}, {x: dx, y: dy}, {x: -dx, y: dy}];
    return corners.map(c => [
        cx + (c.x * cos - c.y * sin),
        cy + (c.x * sin + c.y * cos)
    ]);
}
