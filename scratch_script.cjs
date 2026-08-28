const fs = require('fs');
let file = fs.readFileSync('src/components/compare/MultiPlatformCompare.tsx', 'utf8');
file = file.replace(/logoLetter: "M",/g, 'logoBgClass: "bg-pink-600",\n        logoLetter: "M",');
file = file.replace(/logoLetter: "F",/g, 'logoBgClass: "bg-blue-600",\n        logoLetter: "F",');
file = file.replace(/logoLetter: "A",/g, 'logoBgClass: "bg-amber-600",\n        logoLetter: "A",');
file = file.replace(/logoLetter: "C",/g, 'logoBgClass: "bg-teal-600",\n        logoLetter: "C",');
file = file.replace(/logoLetter: "R",/g, 'logoBgClass: "bg-red-600",\n        logoLetter: "R",');
fs.writeFileSync('src/components/compare/MultiPlatformCompare.tsx', file);
