const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// We want exactly:
//                 </div>
//             </div>
//         </div>
//     </div>
//     <!-- About Modal -->

html = html.replace(
    /<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- About Modal -->/,
    '</p>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <!-- About Modal -->'
);

fs.writeFileSync('index.html', html);
