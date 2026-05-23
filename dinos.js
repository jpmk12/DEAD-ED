// Cartoon dinosaur SVGs. Each viewBox is 100x100, dino fills most of it.
// Friendly proportions: big eye, smile, rounded body, soft colors.
window.DINO_SVGS = {
  trex: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 68 Q -2 58 5 53 L 22 65 Z" fill="#7cb342"/>
    <rect x="48" y="76" width="10" height="17" rx="4" fill="#689f38"/>
    <ellipse cx="53" cy="93" rx="8" ry="3" fill="#558b2f"/>
    <ellipse cx="38" cy="62" rx="30" ry="22" fill="#9ccc65"/>
    <ellipse cx="38" cy="70" rx="20" ry="11" fill="#dcedc8"/>
    <rect x="28" y="76" width="10" height="17" rx="4" fill="#7cb342"/>
    <ellipse cx="33" cy="93" rx="8" ry="3" fill="#558b2f"/>
    <path d="M 58 58 q 4 2 6 6" stroke="#7cb342" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M 48 50 Q 52 28 78 32 Q 95 35 92 55 Q 85 62 65 58 Q 52 56 48 50 Z" fill="#9ccc65"/>
    <path d="M 65 55 Q 78 60 90 54" stroke="#558b2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <polygon points="76,55 78,60 80,55" fill="white"/>
    <polygon points="84,55 86,60 88,55" fill="white"/>
    <circle cx="78" cy="43" r="5" fill="white"/>
    <circle cx="79" cy="44" r="3" fill="#222"/>
    <circle cx="80" cy="43" r="1" fill="white"/>
    <circle cx="30" cy="55" r="2.5" fill="#7cb342"/>
    <circle cx="45" cy="50" r="2" fill="#7cb342"/>
    <circle cx="55" cy="65" r="2" fill="#7cb342"/>
  </svg>`,

  bronto: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 72 Q -2 62 5 58 Q 18 64 25 72 Z" fill="#9c27b0"/>
    <ellipse cx="40" cy="68" rx="32" ry="20" fill="#ba68c8"/>
    <ellipse cx="40" cy="74" rx="22" ry="11" fill="#e1bee7"/>
    <rect x="22" y="78" width="9" height="16" rx="4" fill="#9c27b0"/>
    <rect x="34" y="80" width="9" height="14" rx="4" fill="#9c27b0"/>
    <rect x="48" y="80" width="9" height="14" rx="4" fill="#9c27b0"/>
    <rect x="60" y="78" width="9" height="16" rx="4" fill="#9c27b0"/>
    <path d="M 58 58 Q 70 30 82 22 Q 92 18 90 32 Q 86 44 76 50 Q 68 56 58 58 Z" fill="#ba68c8"/>
    <ellipse cx="86" cy="22" rx="10" ry="8" fill="#ba68c8"/>
    <circle cx="89" cy="20" r="3.5" fill="white"/>
    <circle cx="90" cy="21" r="2.2" fill="#222"/>
    <circle cx="91" cy="20" r="0.7" fill="white"/>
    <path d="M 83 26 q 4 3 8 0" stroke="#6a1b9a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="60" r="2.5" fill="#9c27b0"/>
    <circle cx="45" cy="58" r="2" fill="#9c27b0"/>
    <circle cx="55" cy="65" r="2.5" fill="#9c27b0"/>
  </svg>`,

  trike: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 70 Q -2 62 6 58 L 22 68 Z" fill="#e65100"/>
    <ellipse cx="38" cy="65" rx="30" ry="20" fill="#ff9800"/>
    <ellipse cx="38" cy="72" rx="20" ry="10" fill="#ffe0b2"/>
    <rect x="22" y="78" width="9" height="15" rx="4" fill="#e65100"/>
    <rect x="36" y="80" width="9" height="13" rx="4" fill="#e65100"/>
    <rect x="50" y="78" width="9" height="15" rx="4" fill="#e65100"/>
    <path d="M 55 52 Q 65 28 90 38 Q 88 58 76 62 Q 64 62 55 56 Z" fill="#fb8c00"/>
    <path d="M 62 50 Q 74 38 84 44" stroke="#ffcc80" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="72" cy="54" rx="14" ry="11" fill="#ff9800"/>
    <polygon points="66,40 70,26 72,42" fill="#fff8e1" stroke="#ffe082" stroke-width="0.5"/>
    <polygon points="74,40 78,26 80,42" fill="#fff8e1" stroke="#ffe082" stroke-width="0.5"/>
    <polygon points="82,58 90,50 86,60" fill="#fff8e1" stroke="#ffe082" stroke-width="0.5"/>
    <circle cx="76" cy="52" r="3.8" fill="white"/>
    <circle cx="77" cy="53" r="2.3" fill="#222"/>
    <circle cx="78" cy="52" r="0.7" fill="white"/>
    <path d="M 72 58 q 4 3 8 0" stroke="#bf360c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  stego: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 66 Q -2 56 6 52 L 22 64 Z" fill="#1976d2"/>
    <polygon points="2,56 -3,48 6,52" fill="#ffeb3b" stroke="#fbc02d" stroke-width="0.5"/>
    <ellipse cx="40" cy="66" rx="30" ry="20" fill="#42a5f5"/>
    <ellipse cx="40" cy="73" rx="20" ry="10" fill="#bbdefb"/>
    <rect x="22" y="78" width="9" height="15" rx="4" fill="#1976d2"/>
    <rect x="36" y="80" width="9" height="13" rx="4" fill="#1976d2"/>
    <rect x="50" y="80" width="9" height="13" rx="4" fill="#1976d2"/>
    <rect x="62" y="78" width="9" height="15" rx="4" fill="#1976d2"/>
    <polygon points="18,55 24,38 30,55" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1"/>
    <polygon points="32,52 38,32 44,52" fill="#ffca28" stroke="#fbc02d" stroke-width="1"/>
    <polygon points="46,52 52,32 58,52" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1"/>
    <polygon points="60,55 66,38 72,55" fill="#ffca28" stroke="#fbc02d" stroke-width="1"/>
    <ellipse cx="80" cy="68" rx="13" ry="10" fill="#42a5f5"/>
    <circle cx="86" cy="65" r="3.8" fill="white"/>
    <circle cx="87" cy="66" r="2.3" fill="#222"/>
    <circle cx="88" cy="65" r="0.7" fill="white"/>
    <path d="M 82 71 q 4 3 8 0" stroke="#0d47a1" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  raptor: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 68 Q -2 58 6 53 L 22 64 Z" fill="#c2185b"/>
    <ellipse cx="40" cy="64" rx="27" ry="20" fill="#ec407a"/>
    <ellipse cx="40" cy="72" rx="18" ry="10" fill="#f8bbd0"/>
    <rect x="32" y="78" width="9" height="15" rx="4" fill="#c2185b"/>
    <rect x="46" y="78" width="9" height="15" rx="4" fill="#c2185b"/>
    <ellipse cx="37" cy="93" rx="7" ry="3" fill="#880e4f"/>
    <ellipse cx="51" cy="93" rx="7" ry="3" fill="#880e4f"/>
    <path d="M 58 58 q 5 1 7 5" stroke="#c2185b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M 50 48 Q 55 28 78 32 Q 90 36 88 54 Q 80 60 62 56 Q 52 54 50 48 Z" fill="#ec407a"/>
    <polygon points="58,36 52,24 64,30" fill="#f48fb1"/>
    <path d="M 70 54 Q 80 58 88 53" stroke="#880e4f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <polygon points="78,54 80,58 82,54" fill="white"/>
    <circle cx="76" cy="44" r="5" fill="white"/>
    <circle cx="77" cy="45" r="3" fill="#222"/>
    <circle cx="78" cy="44" r="1" fill="white"/>
    <circle cx="32" cy="56" r="2.5" fill="#c2185b"/>
    <circle cx="44" cy="52" r="2" fill="#c2185b"/>
    <circle cx="55" cy="66" r="2" fill="#c2185b"/>
  </svg>`,
};

// Ordered list for cycling through cards.
window.DINO_KEYS = ['trex', 'bronto', 'trike', 'stego', 'raptor'];
