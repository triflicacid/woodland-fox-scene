# Scripts

This directory contains some useful scripts used during development of this project.

*Disclaimer* These scripts were generated with assistance of AI.

- `add-public-modifiers.mjs` Adds the `public` modifier where it would otherwise be inferred.
- `ensure-trailing-newline.mjs <file/directory>` Ensures that every file (recursively) in `directory` ends with a newline.
- `normalise-line-endings.mjs <file/directory>` Normalises all line-endings in `<file>` or every file (recursively) in `directory` to `LF`.
- `remove-trailing-whitespace.mjs <file/directory>` Removes trailing whitespace from `<file>` or every file (recursively) in `directory`.
- `rename-underscore-member-declarations.mjs <file/directory>` Renames all member declarations with a leading underscore to a `private` field (+ removes the unserscore) in `<file>` or every file (recursively) in `directory`. It preserves an existing `private` or `protected` modifier. If the field is `public`, the script does nothing but prints a warning.
- `single-quote-imports.mjs <file/directory>` Replaces all double-quotes used in `import` statements with single-quotes in `<file>` or every file (recursively) in `directory`.
