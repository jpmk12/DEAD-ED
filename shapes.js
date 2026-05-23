// 9 shapes as colorful SVGs. Each shape uses a distinct fill color so
// they're visually memorable and easy to tell apart at choice-tile size.
// Rectangle and Oval are deliberately drawn at the same proportions
// (both wider than tall) so the distinguishing feature is the corner
// shape (sharp vs round), which is the exact concept the kindergarten
// test checks.
window.SHAPES = [
  {
    name: 'Circle',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#ff8787" stroke="#c92a2a" stroke-width="5"/>
    </svg>`,
  },
  {
    name: 'Square',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="13" width="74" height="74" rx="4" fill="#ffc078" stroke="#d9480f" stroke-width="5"/>
    </svg>`,
  },
  {
    name: 'Rectangle',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="30" width="88" height="40" rx="3" fill="#ffe066" stroke="#e67700" stroke-width="5"/>
    </svg>`,
  },
  {
    name: 'Triangle',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 90,85 10,85" fill="#8ce99a" stroke="#2b8a3e" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'Star',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 61,38 90,40 67,60 76,90 50,72 24,90 33,60 10,40 39,38" fill="#ffe066" stroke="#f08c00" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'Heart',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 86 C 20 65 5 40 20 22 C 30 12 45 18 50 30 C 55 18 70 12 80 22 C 95 40 80 65 50 86 Z" fill="#ff8fab" stroke="#c2255c" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'Diamond',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,8 92,50 50,92 8,50" fill="#d0bfff" stroke="#6741d9" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'Oval',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="50" rx="44" ry="26" fill="#74c0fc" stroke="#1971c2" stroke-width="5"/>
    </svg>`,
  },
  {
    name: 'Hexagon',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,8 90,30 90,70 50,92 10,70 10,30" fill="#63e6be" stroke="#087f5b" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
];
