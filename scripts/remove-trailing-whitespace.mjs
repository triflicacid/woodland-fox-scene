import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const INCLUDED_EXTENSIONS = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.jsx',
    '.md',
    '.mjs',
    '.ts',
    '.tsx',
]);

const EXCLUDED_DIRS = new Set([
    '.git',
    '.idea',
    'dist',
    'node_modules',
]);

function walk(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) {
                return [];
            }

            return walk(fullPath);
        }

        if (!entry.isFile()) {
            return [];
        }

        const extension = path.extname(entry.name).toLowerCase();

        if (!INCLUDED_EXTENSIONS.has(extension)) {
            return [];
        }

        return [fullPath];
    });
}

function removeTrailingWhitespace(filePath) {
    const original = fs.readFileSync(filePath, 'utf8');

    const updated = original
        .split('\n')
        .map(line => line.replace(/[\s\t]+$/g, ''))
        .join('\n');

    if (updated === original) {
        return false;
    }

    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
}

const changedFiles = walk(ROOT).filter(removeTrailingWhitespace);

console.log(`Removed trailing whitespace from ${changedFiles.length} file(s).`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}
