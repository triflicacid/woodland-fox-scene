import {defineConfig} from 'vite';
import {viteSingleFile} from "vite-plugin-singlefile";
import {resolve} from 'path';

export default defineConfig({
    base: './',
    plugins: [viteSingleFile()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        sourcemap: true,
    },
});
