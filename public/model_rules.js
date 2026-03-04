const ModelRules = {
    "seg": {
        name: "SEG (Segmentation)",
        parseGT: (r) => {
            if (r.type === "RotatedRect") return ModelRules.ord.parseGT(r);
            return { points: r.points, type: 'polygon' };
        },
        parsePred: (ann) => {
            if (ann.obox) return ModelRules.ord.parsePred(ann);
            if (!ann.segmentation || !ann.segmentation[0]) return null;
            const pts = [];
            for (let i = 0; i < ann.segmentation[0].length; i += 2) {
                pts.push([ann.segmentation[0][i], ann.segmentation[0][i+1]]);
            }
            return { points: pts, type: 'polygon' };
        }
    },
    "ord": {
        name: "ORD (Oriented Object Detection)",
        parseGT: (r) => {
            if (r.cx === undefined) return null;
            return { cx: r.cx, cy: r.cy, w: r.width, h: r.height, angle: r.angle, type: 'rotated_rect' };
        },
        parsePred: (ann) => {
            const d = ann.obox || ann.bbox;
            if (!d || d.length < 5) return null;
            // 순서: [cx, cy, w, h, angle]
            return { cx: d[0], cy: d[1], w: d[2], h: d[3], angle: d[4], type: 'rotated_rect' };
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
