/* ==========================================================================
   ball.js
   Generates a simple round "ball" character avatar as inline SVG, built
   only from stripe colors — no external images, so every entry/profile
   gets a unique original avatar with zero assets to manage.
   ========================================================================== */

/**
 * Build an SVG string for a ball character.
 * @param {string[]} colors - 2 or 3 hex colors, used as horizontal stripes.
 * @returns {string} inline SVG markup
 */
function ballSVG(colors) {
  const c = (colors && colors.length ? colors : ["#888888"]).slice(0, 3);
  const stripeHeight = 100 / c.length;

  const stripes = c.map((color, i) => {
    const y = i * stripeHeight;
    return `<rect x="0" y="${y}" width="100" height="${stripeHeight + 0.5}" fill="${color}" />`;
  }).join("");

  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">
      <defs>
        <clipPath id="clip-${cssSafeId(c)}">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="49" fill="#00000022" />
      <g clip-path="url(#clip-${cssSafeId(c)})">
        ${stripes}
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#00000030" stroke-width="2" />
      <circle cx="38" cy="46" r="4.5" fill="#1a1a1a" />
      <circle cx="62" cy="46" r="4.5" fill="#1a1a1a" />
    </svg>
  `;
}

// Small helper so the clipPath id is valid and reasonably unique per color set.
function cssSafeId(colors) {
  return colors.join("").replace(/[^a-zA-Z0-9]/g, "");
}

/** Renders a ball's SVG into a container element. */
function renderBallInto(el, colors) {
  el.innerHTML = ballSVG(colors);
}
