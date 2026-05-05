import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const ACCESS_MODIFIER_RE = /^\s*(public|private|protected)\b/;
const DECORATOR_RE = /^\s*@/;
const COMMENT_OR_BLANK_RE = /^\s*(\/\/|\/\*|\*|$)/;

const CLASS_RE = /\bclass\s+\w+/;

const CLASS_MEMBER_START_RE =
    /^(\s*)(?!(?:public|private|protected)\b)(?!(?:if|for|while|switch|catch|return|throw|const|let|var|type|interface|enum|export|import)\b)(?:(?:static|override|readonly|abstract|async|declare|accessor|get|set)\s+)*[#A-Za-z_$][\w$#]*\s*(?:[<(:!?=;]|\()/;

const CONSTRUCTOR_RE =
    /^(\s*)(?!(?:public|private|protected)\b)constructor\s*\(/;

function walk(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return walk(fullPath);
        }

        if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
            return [fullPath];
        }

        return [];
    });
}

function stripStringsAndComments(line, state) {
    let out = "";
    let i = 0;

    while (i < line.length) {
        const ch = line[i];
        const next = line[i + 1];

        if (state.blockComment) {
            if (ch === "*" && next === "/") {
                state.blockComment = false;
                out += "  ";
                i += 2;
            } else {
                out += " ";
                i++;
            }
            continue;
        }

        if (state.string) {
            if (ch === "\\") {
                out += "  ";
                i += 2;
                continue;
            }

            if (ch === state.string) {
                state.string = null;
            }

            out += " ";
            i++;
            continue;
        }

        if (ch === "/" && next === "*") {
            state.blockComment = true;
            out += "  ";
            i += 2;
            continue;
        }

        if (ch === "/" && next === "/") {
            out += " ".repeat(line.length - i);
            break;
        }

        if (ch === "'" || ch === '"' || ch === "`") {
            state.string = ch;
            out += " ";
            i++;
            continue;
        }

        out += ch;
        i++;
    }

    return out;
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

function addPublicToFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const lines = original.split("\n");

    const output = [];
    const state = {
        blockComment: false,
        string: null,
    };

    let pendingClass = false;
    let classDepth = null;
    let braceDepth = 0;
    let changed = false;

    for (const line of lines) {
        const beforeDepth = braceDepth;

        let nextLine = line;

        const inClassTopLevel = classDepth !== null && beforeDepth === classDepth;

        if (
            inClassTopLevel &&
            !COMMENT_OR_BLANK_RE.test(line) &&
            !DECORATOR_RE.test(line) &&
            !ACCESS_MODIFIER_RE.test(line)
        ) {
            const constructorMatch = line.match(CONSTRUCTOR_RE);
            const memberMatch = line.match(CLASS_MEMBER_START_RE);

            if (constructorMatch || memberMatch) {
                const indent = constructorMatch?.[1] ?? memberMatch?.[1] ?? "";
                nextLine = line.replace(indent, `${indent}public `);
                changed = true;
            }
        }

        output.push(nextLine);

        const delta = braceDelta(line, state);

        if (CLASS_RE.test(line)) {
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
        return true;
    }

    return false;
}

const files = walk(SRC_DIR);
const changedFiles = files.filter(addPublicToFile);

console.log(`Updated ${changedFiles.length} file(s).`);

for (const file of changedFiles) {
    console.log(`- ${path.relative(ROOT, file)}`);
}
