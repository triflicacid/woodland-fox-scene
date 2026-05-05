import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    ".idea",
]);

const TEXT_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
    ".xml",
    ".svg",
    ".env",
    ".gitignore",
    ".npmrc",
    ".editorconfig",
]);

function usage() {
    console.error("Usage: node scripts/normalise-line-endings.mjs <file-or-directory>");
}

function isTextFile(filePath) {
    const basename = path.basename(filePath);
    const ext = path.extname(filePath);

    return TEXT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(basename);
}

function walk(targetPath) {
    const stats = fs.statSync(targetPath);

    if (stats.isDirectory()) {
        const basename = path.basename(targetPath);

        if (SKIP_DIRS.has(basename)) {
            return [];
        }

        const entries = fs.readdirSync(targetPath, {withFileTypes: true});

        return entries.flatMap(entry => {
            const fullPath = path.join(targetPath, entry.name);
            return walk(fullPath);
        });
    }

    if (stats.isFile() && isTextFile(targetPath)) {
        return [targetPath];
    }

    return [];
}

function normaliseFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const normalised = original.replace(/\r\n?/g, "\n");

    if (normalised === original) {
        return false;
    }

    fs.writeFileSync(filePath, normalised, "utf8");
    return true;
}

const targetArg = process.argv[2];

if (!targetArg) {
    usage();
    process.exit(1);
}

const targetPath = path.resolve(ROOT, targetArg);

if (!fs.existsSync(targetPath)) {
    console.error(`Path does not exist: ${targetArg}`);
    process.exit(1);
}

const changedFiles = walk(targetPath).filter(normaliseFile);

console.log(`Normalised ${changedFiles.length} file(s) to LF.`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}
