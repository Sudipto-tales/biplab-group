const fs = require('fs');

const indexHtml = fs.readFileSync('index2.html', 'utf-8');
const styleCss = fs.readFileSync('style.css', 'utf-8');
const scriptJs = fs.readFileSync('script.js', 'utf-8');

let newHtml = indexHtml;

newHtml = newHtml.replace('<link rel="stylesheet" href="style.css">', `<style>\n${styleCss}\n    </style>`);
newHtml = newHtml.replace('<script src="script.js"></script>', `<script>\n${scriptJs}\n    </script>`);

const imageMap = {
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab': 'images/image_1.jpg',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7': 'images/image_2.jpg',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f': 'images/image_3.jpg',
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc': 'images/image_4.jpg',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7': 'images/image_5.jpg',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b': 'images/image_6.jpg',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd': 'images/image_7.jpg'
};

for (const [url, localPath] of Object.entries(imageMap)) {
    // Replace all occurrences of the url
    newHtml = newHtml.split(url).join(localPath);
}

fs.writeFileSync('index2.html', newHtml, 'utf-8');
console.log('Successfully inlined CSS/JS and updated images.');
