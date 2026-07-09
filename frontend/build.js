const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const outDir = path.join(__dirname, 'static');

if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir);
}

const baseHtml = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf8');

function buildPage(filename, outFilename) {
    const pageHtml = fs.readFileSync(path.join(templatesDir, filename), 'utf8');
    
    // Extract content from {% block content %}
    const contentMatch = pageHtml.match(/{%\s*block\s+content\s*%}([\s\S]*){%\s*endblock\s*%}/);
    let content = contentMatch ? contentMatch[1] : pageHtml;
    
    // Inject content into base.html
    let finalHtml = baseHtml.replace('{% block content %}{% endblock %}', content);
    
    // Replace Flask {{ url_for(...) }} with standard static paths
    finalHtml = finalHtml.replace(/{{ url_for\('static',\s*filename='(.*?)'\)\s*}}/g, '/$1');
    finalHtml = finalHtml.replace(/{{ url_for\('static',\s*filename="(.*?)"\)\s*}}/g, '/$1');
    
    // Inject the Environment Variable into the HTML Head
    // It defaults to your current Render URL if the env var isn't set
    const apiUrl = process.env.API_URL || 'https://salary-prediction-o1cz.onrender.com';
    finalHtml = finalHtml.replace('</head>', `    <script>window.ENV_API_URL = "${apiUrl}";</script>\n</head>`);
    
    fs.writeFileSync(path.join(outDir, outFilename), finalHtml);
}

// Build the two pages
buildPage('index.html', 'index.html');
buildPage('predict.html', 'predict.html');

console.log('Build complete. API URL set to:', process.env.API_URL || 'default fallback');
