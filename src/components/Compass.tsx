export default function Compass() {
  const size = 600;
  const c = size / 2;
  const color = "#c41e3a";

  // 外圈刻度线 - 每度一条
  const ticks = Array.from({ length: 360 }, (_, i) => {
    const angle = i - 90; // 从正上方开始，顺时针
    const rad = (angle * Math.PI) / 180;
    const isMain = i % 10 === 0;
    const isSub = i % 5 === 0;
    const innerR = isMain ? 240 : isSub ? 245 : 250;
    const outerR = 255;
    return {
      x1: c + innerR * Math.cos(rad),
      y1: c + innerR * Math.sin(rad),
      x2: c + outerR * Math.cos(rad),
      y2: c + outerR * Math.sin(rad),
      width: isMain ? 2 : isSub ? 1.2 : 0.8,
    };
  });

  // 最外圈数字 0, 10, 20... 350 - 顺时针递增
  const numbers = Array.from({ length: 36 }, (_, i) => {
    const value = i * 10;
    const angle = value - 90; // 0度在正上方
    const rad = (angle * Math.PI) / 180;
    const radius = 275;
    return {
      value: value.toString(),
      x: c + radius * Math.cos(rad),
      y: c + radius * Math.sin(rad),
      angle: angle,
    };
  });

  // 二十四山
  const mountains24 = [
    { name: "子", angle: 0 },
    { name: "癸", angle: 15 },
    { name: "丑", angle: 30 },
    { name: "艮", angle: 45 },
    { name: "寅", angle: 60 },
    { name: "甲", angle: 75 },
    { name: "卯", angle: 90 },
    { name: "乙", angle: 105 },
    { name: "辰", angle: 120 },
    { name: "巽", angle: 135 },
    { name: "巳", angle: 150 },
    { name: "丙", angle: 165 },
    { name: "午", angle: 180 },
    { name: "丁", angle: 195 },
    { name: "未", angle: 210 },
    { name: "坤", angle: 225 },
    { name: "申", angle: 240 },
    { name: "庚", angle: 255 },
    { name: "酉", angle: 270 },
    { name: "辛", angle: 285 },
    { name: "戌", angle: 300 },
    { name: "乾", angle: 315 },
    { name: "亥", angle: 330 },
    { name: "壬", angle: 345 },
  ];

  // 八个方位（在8条放射线中间，即正方位）
  const directions8 = [
    { name: "北", angle: 0 },
    { name: "东北", angle: 45 },
    { name: "东", angle: 90 },
    { name: "东南", angle: 135 },
    { name: "南", angle: 180 },
    { name: "西南", angle: 225 },
    { name: "西", angle: 270 },
    { name: "西北", angle: 315 },
  ];

  // 3个同心圆
  const rings = [140, 180, 220, 255];

  // 8条放射线 - 从22.5度开始，每45度一条，穿过东南西北层
  const radialLines = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45 + 22.5 - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: c,
      y1: c,
      x2: c + 180 * Math.cos(rad),
      y2: c + 180 * Math.sin(rad),
    };
  });

  // 汉字圈层分隔竖线 - 从7.5度开始，每15度一根
  const charSeparators = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15 + 7.5 - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: c + 180 * Math.cos(rad),
      y1: c + 180 * Math.sin(rad),
      x2: c + 220 * Math.cos(rad),
      y2: c + 220 * Math.sin(rad),
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 透明背景 */}
      <rect width={size} height={size} fill="transparent" />

      {/* 同心圆环 */}
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      ))}

      {/* 8条放射线 - 从22.5度开始 */}
      {radialLines.map((line, i) => (
        <line
          key={`radial-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={color}
          strokeWidth={1}
        />
      ))}

      {/* 汉字圈层分隔竖线 - 从7.5度开始，每15度一根 */}
      {charSeparators.map((line, i) => (
        <line
          key={`sep-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={color}
          strokeWidth={1}
        />
      ))}

      {/* 刻度线 */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={color}
          strokeWidth={t.width}
        />
      ))}

      {/* 外圈数字 - 离心排列 */}
      {numbers.map((n, i) => (
        <text
          key={i}
          x={n.x}
          y={n.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={11}
          fontFamily="sans-serif"
          transform={`rotate(${n.angle + 90}, ${n.x}, ${n.y})`}
        >
          {n.value}
        </text>
      ))}

      {/* 二十四山汉字 - 向心排列 */}
      {mountains24.map((m) => {
        const rad = ((m.angle - 90) * Math.PI) / 180;
        const radius = 200;
        const x = c + radius * Math.cos(rad);
        const y = c + radius * Math.sin(rad);
        const rotation = m.angle;
        return (
          <text
            key={m.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={22}
            fontFamily="serif"
            fontWeight="bold"
            transform={`rotate(${rotation}, ${x}, ${y})`}
          >
            {m.name}
          </text>
        );
      })}

      {/* 八个方位 - 在二十四山内侧，向心排列 */}
      {directions8.map((d) => {
        const rad = ((d.angle - 90) * Math.PI) / 180;
        const radius = 160;
        const x = c + radius * Math.cos(rad);
        const y = c + radius * Math.sin(rad);
        const rotation = d.angle;
        return (
          <text
            key={d.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={18}
            fontFamily="serif"
            fontWeight="bold"
            transform={`rotate(${rotation}, ${x}, ${y})`}
          >
            {d.name}
          </text>
        );
      })}

      {/* 中心点 */}
      <circle cx={c} cy={c} r={3} fill={color} />
    </svg>
  );
}
