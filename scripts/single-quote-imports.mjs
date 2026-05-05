import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    ".idea",
]);

const TARGET_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
]);

function usage() {
    console.error("Usage: node scripts/single-quote-imports.mjs <file-or-directory>");
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

    if (stats.isFile() && TARGET_EXTENSIONS.has(path.extname(targetPath))) {
        return [targetPath];
    }

    return [];
}

function normaliseImportQuotes(text) {
    return text
        // import ... from "module"
        .replace(
            /(\bimport\s+(?:type\s+)?[\s\S]*?\s+from\s+)"([^"\n\r]+)"/g,
            "$1'$2'",
        )
        // import "module"
        .replace(
            /(\bimport\s+)"([^"\n\r]+)"/g,
            "$1'$2'",
        )
        // export ... from "module"
        .replace(
            /(\bexport\s+[\s\S]*?\s+from\s+)"([^"\n\r]+)"/g,
            "$1'$2'",
        );
}

function transformFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const updated = normaliseImportQuotes(original);

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

const targetPath = path.resolve(ROOT, targetArg);

if (!fs.existsSync(targetPath)) {
    console.error(`Path does not exist: ${targetArg}`);
    process.exit(1);
}

const changedFiles = walk(targetPath).filter(transformFile);

console.log(`Updated ${changedFiles.length} file(s).`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}
