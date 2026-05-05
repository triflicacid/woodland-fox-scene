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
    console.error("Usage: node scripts/ensure-trailing-newline.mjs <file-or-directory>");
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

        return fs.readdirSync(targetPath, {withFileTypes: true}).flatMap(entry => {
            return walk(path.join(targetPath, entry.name));
        });
    }

    if (stats.isFile() && isTextFile(targetPath)) {
        return [targetPath];
    }

    return [];
}

function ensureTrailingNewline(filePath) {
    const original = fs.readFileSync(filePath, "utf8");

    const withoutTrailingNewlines = original.replace(/[\r\n]+$/g, "");
    const updated = `${withoutTrailingNewlines}\n`;

    if (updated === original) {
        return false;
    }

    fs.writeFileSync(filePath, updated, "utf8");
    return true;
}

const targetArg = process.argv[2];

if (!targetArg) {
    usage();
    process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);

if (!fs.existsSync(targetPath)) {
    console.error(`Path does not exist: ${targetArg}`);
    process.exit(1);
}

const changedFiles = walk(targetPath).filter(ensureTrailingNewline);

console.log(`Updated ${changedFiles.length} file(s).`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}
