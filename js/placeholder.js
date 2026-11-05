/* ==========================================================================
   placeholder.js
   Procedurally generates a unique "ball" avatar (as an inline SVG data URL)
   from an entry's name, with no external art needed. Used whenever an
   entry has no uploaded image yet, or its image fails to load. Everything
   here is drawn from scratch — simple shapes and colors, nothing modeled
   on any existing character or franchise.
   ========================================================================== */

const PLACEHOLDER_PALETTES = [
  ["#7C3AED", "#EC4899"],
  ["#22D3EE", "#7C3AED"],
  ["#FFB800", "#EC4899"],
  ["#22D3EE", "#FFB800"],
  ["#EC4899", "#FFB800", "#7C3AED"],
  ["#22D3EE", "#EC4899", "#FFB800"],
  ["#7C3AED", "#22D3EE", "#FFB800"],
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function generatePlaceholderSVG(name) {
  const h = hashString(name || "atlas entry");
  const colors = PLACEHOLDER_PALETTES[h % PLACEHOLDER_PALETTES.length];
  const pattern = ["stripes", "diagonal", "split", "dots"][Math.floor(h / 7) % 4];
  const eyeStyle = ["round", "sleepy", "wide", "wink"][Math.floor(h / 29) % 4];
  const hasAccessory = h % 5 === 0;
  const clipId = "ph-clip-" + h;

  let fill = "";

  if (pattern === "stripes") {
    const n = colors.length;
    fill = colors.map((c, i) => {
      const y = (100 / n) * i;
      const hgt = 100 / n + 0.5;
      return `<rect x="0" y="${y}" width="100" height="${hgt}" fill="${c}" />`;
    }).join("");
  } else if (pattern === "diagonal") {
    fill = `<rect x="-20" y="-20" width="140" height="140" fill="${colors[0]}" />
      <g transform="rotate(45 50 50)">
        ${colors.slice(1).map((c, i) => `<rect x="-30" y="${-20 + i * 34}" width="160" height="18" fill="${c}" />`).join("")}
      </g>`;
  } else if (pattern === "split") {
    fill = `<rect x="0" y="0" width="50" height="100" fill="${colors[0]}" />
      <rect x="50" y="0" width="50" height="100" fill="${colors[1] || colors[0]}" />`;
  } else {
    // dots
    const dotColor = colors[1] || colors[0];
    let dots = "";
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const offset = row % 2 === 0 ? 0 : 12;
        dots += `<circle cx="${10 + col * 24 + offset}" cy="${10 + row * 26}" r="7" fill="${dotColor}" opacity="0.85" />`;
      }
    }
    fill = `<rect x="0" y="0" width="100" height="100" fill="${colors[0]}" />${dots}`;
  }

  let eyes = "";
  if (eyeStyle === "round") {
    eyes = `<circle cx="38" cy="46" r="4.5" fill="#1a1a1a" /><circle cx="62" cy="46" r="4.5" fill="#1a1a1a" />`;
  } else if (eyeStyle === "sleepy") {
    eyes = `<path d="M32,46 Q38,40 44,46" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M56,46 Q62,40 68,46" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />`;
  } else if (eyeStyle === "wide") {
    eyes = `<circle cx="38" cy="46" r="6" fill="#1a1a1a" /><circle cx="40" cy="44" r="1.6" fill="#fff" />
      <circle cx="62" cy="46" r="6" fill="#1a1a1a" /><circle cx="64" cy="44" r="1.6" fill="#fff" />`;
  } else {
    eyes = `<circle cx="38" cy="46" r="4.5" fill="#1a1a1a" />
      <path d="M57,46 Q62,42 67,46" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />`;
  }

  const accessory = hasAccessory
    ? `<line x1="50" y1="6" x2="50" y2="16" stroke="#1a1a1a" stroke-width="2" />
       <circle cx="50" cy="5" r="3.5" fill="${colors[colors.length - 1]}" />`
    : "";

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">
    <defs><clipPath id="${clipId}"><circle cx="50" cy="50" r="48" /></clipPath></defs>
    <g clip-path="url(#${clipId})">${fill}</g>
    <circle cx="50" cy="50" r="48" fill="none" stroke="#00000030" stroke-width="2" />
    ${eyes}
    ${accessory}
  </svg>`;
}

function generatePlaceholderDataURL(name) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(generatePlaceholderSVG(name));
}
