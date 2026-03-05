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
            // COCO 스타일 nested array 또는 flat array 대응
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
            if (r.cx === undefined) return null;
            return { cx: r.cx, cy: r.cy, w: r.width, h: r.height, angle: r.angle, type: 'rotated_rect' };
        },
        parsePred: (ann) => {
            const d = ann.obox || ann.bbox;
            if (!d || d.length < 5) return null;
            return { cx: d[0], cy: d[1], w: d[2], h: d[3], angle: d[4], type: 'rotated_rect' };
        }
    },
    "rot": {
        name: "ROT (Rotation)",
        parseGT: (entry) => ({ 
            angle: entry.rotation_angle !== undefined ? entry.rotation_angle : (entry.angle !== undefined ? entry.angle : (parseFloat(entry.classLabel) || 0)), 
            type: 'rotation' 
        }),
        parsePred: (ann) => ({ angle: ann.angle || 0, type: 'rotation' })
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
