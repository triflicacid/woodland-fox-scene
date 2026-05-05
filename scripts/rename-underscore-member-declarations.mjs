import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    ".idea",
]);

const MEMBER_DECLARATION_RE =
    /^(\s*)(?:(public|private|protected)\s+)?((?:(?:static|override|readonly|abstract|async|declare|accessor)\s+)*)(_[A-Za-z_$][\w$]*)\b/;

function usage() {
    console.error("Usage: node scripts/rename-underscore-member-declarations.mjs <file-or-directory>");
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

    if (stats.isFile() && targetPath.endsWith(".ts") && !targetPath.endsWith(".d.ts")) {
        return [targetPath];
    }

    return [];
}

function stripStringsAndComments(line, state) {
    let output = "";
    let i = 0;

    while (i < line.length) {
        const ch = line[i];
        const next = line[i + 1];

        if (state.blockComment) {
            if (ch === "*" && next === "/") {
                state.blockComment = false;
                output += "  ";
                i += 2;
            } else {
                output += " ";
                i++;
            }
            continue;
        }

        if (state.string) {
            if (ch === "\\") {
                output += "  ";
                i += 2;
                continue;
            }

            if (ch === state.string) {
                state.string = null;
            }

            output += " ";
            i++;
            continue;
        }

        if (ch === "/" && next === "*") {
            state.blockComment = true;
            output += "  ";
            i += 2;
            continue;
        }

        if (ch === "/" && next === "/") {
            output += " ".repeat(line.length - i);
            break;
        }

        if (ch === "'" || ch === '"' || ch === "`") {
            state.string = ch;
            output += " ";
            i++;
            continue;
        }

        output += ch;
        i++;
    }

    return output;
}

function braceDelta(line, state) {
    const clean = stripStringsAndComments(line, state);
    let delta = 0;

    for (const ch of clean) {
        if (ch === "{") delta++;
        if (ch === "}") delta--;
    }

    return delta;
}

function transformFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const lines = original.split("\n");

    const output = [];
    const warnings = [];

    const state = {
        blockComment: false,
        string: null,
    };

    let pendingClass = false;
    let classDepth = null;
    let braceDepth = 0;
    let changed = false;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const beforeDepth = braceDepth;
        const inClassTopLevel = classDepth !== null && beforeDepth === classDepth;

        let nextLine = line;

        if (inClassTopLevel) {
            const match = line.match(MEMBER_DECLARATION_RE);

            if (match) {
                const [, indent, accessibility, modifiers, originalName] = match;
                const newName = originalName.slice(1);

                if (accessibility === "public") {
                    warnings.push(
                        `${path.relative(ROOT, filePath)}:${index + 1} public member '${originalName}' was left unchanged.`,
                    );
                } else if (accessibility) {
                    nextLine = line.replace(
                        MEMBER_DECLARATION_RE,
                        `${indent}${accessibility} ${modifiers}${newName}`,
                    );
                    changed = true;
                } else {
                    nextLine = line.replace(
                        MEMBER_DECLARATION_RE,
                        `${indent}private ${modifiers}${newName}`,
                    );
                    changed = true;
                }
            }
        }

        output.push(nextLine);

        const delta = braceDelta(line, state);

        if (/\bclass\s+[A-Za-z_$][\w$]*/.test(line)) {
            pendingClass = true;
        }

        braceDepth += delta;

        if (pendingClass && line.includes("{")) {
            classDepth = beforeDepth + 1;
            pendingClass = false;
        }

        if (classDepth !== null && braceDepth < classDepth) {
            classDepth = null;
        }
    }

    const updated = output.join("\n");

    if (changed && updated !== original) {
        fs.writeFileSync(filePath, updated, "utf8");
    }

    return {
        changed: changed && updated !== original,
        warnings,
    };
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

const files = walk(targetPath);
const changedFiles = [];
const warnings = [];

for (const file of files) {
    const result = transformFile(file);

    if (result.changed) {
        changedFiles.push(file);
    }

    warnings.push(...result.warnings);
}

for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
}

console.log(`Updated ${changedFiles.length} file(s).`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}

if (warnings.length > 0) {
    console.log(`Emitted ${warnings.length} warning(s).`);
}
