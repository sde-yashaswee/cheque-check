const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(projectRoot);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('hugeicons-react')) return;

  console.log(`Processing ${file}...`);

  // Handle import { HugeiconsIcon } from '@hugeicons/react';
import * as HugeIcons from '@hugeicons/core-free-icons';
  if (content.includes("import * as HugeIcons from 'hugeicons-react'")) {
    content = content.replace(
      "import * as HugeIcons from 'hugeicons-react'",
      "import { HugeiconsIcon } from '@hugeicons/react';\nimport * as HugeIcons from '@hugeicons/core-free-icons';"
    );
    
    // In src/components/ui/entity-avatar.tsx:
    // <IconComponent className={iconSizeClasses[size]} />
    // Should become:
    // <HugeiconsIcon icon={IconComponent} className={iconSizeClasses[size]} />
    if (file.includes('entity-avatar.tsx')) {
      content = content.replace(
        '<IconComponent className={iconSizeClasses[size]} />',
        '<HugeiconsIcon icon={IconComponent} className={iconSizeClasses[size]} />'
      );
    }
  }

  // Handle named imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]hugeicons-react['"]/g;
  let match;
  const importedIcons = [];

  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1].split(',').map(s => s.trim()).filter(Boolean);
    namedImports.forEach(item => {
      const parts = item.split(/\s+as\s+/);
      const originalName = parts[0].trim();
      const aliasName = parts[1] ? parts[1].trim() : originalName;
      importedIcons.push(aliasName);
    });
  }

  if (importedIcons.length > 0) {
    // Replace import statement
    content = content.replace(importRegex, (m, p1) => {
      return `import { HugeiconsIcon } from '@hugeicons/react';\nimport {${p1}} from '@hugeicons/core-free-icons';`;
    });

    // Replace JSX usages
    importedIcons.forEach(iconName => {
      // Replace <IconName ... /> with <HugeiconsIcon icon={IconName} ... />
      // Match <IconName followed by space or > or />
      const openingTagRegex = new RegExp(`<${iconName}(\\s|\\/|>)`, 'g');
      content = content.replace(openingTagRegex, (m, p1) => {
        if (p1 === '>') return `<HugeiconsIcon icon={${iconName}}>`;
        if (p1 === '/') return `<HugeiconsIcon icon={${iconName}}/`; // handles <IconName/> -> <HugeiconsIcon icon={IconName}/>
        return `<HugeiconsIcon icon={${iconName}} `;
      });

      // Replace </IconName> with </HugeiconsIcon>
      const closingTagRegex = new RegExp(`</${iconName}>`, 'g');
      content = content.replace(closingTagRegex, `</HugeiconsIcon>`);
    });
  }

  fs.writeFileSync(file, content);
});

console.log('Refactoring complete.');
