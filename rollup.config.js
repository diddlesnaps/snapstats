import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import autoPreprocess from 'svelte-preprocess';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning);
const dedupe = importee => importee === 'svelte' || importee.startsWith('svelte/');

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode),
				'__fetch': 'window.fetch',
				'http://localhost:3000/graphql': dev ? 'http://localhost:3000/graphql' : 'https://snapstats.org/graphql',
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true,
				preprocess: autoPreprocess(),
			}),
			resolve({
				browser: true,
				dedupe,
			}),
			commonjs(),
			typescript({ sourceMap: dev }),

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				runtimeHelpers: true,
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-proposal-optional-chaining',
					'@babel/plugin-proposal-nullish-coalescing-operator',
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			})
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode),
				'__fetch': 'require("node-fetch")',
				'http://localhost:3000/graphql': dev ? 'http://localhost:3000/graphql' : 'https://snapstats.org/graphql',
			}),
			replace({
				'"__sapper__/build"': 'process.cwd()',
				'delimiters': ['',''],
			}),
			!dev && replace({
				'!emitted_basepath && process.send': 'false',
				'delimiters': ['',''],
			}),
			svelte({
				generate: 'ssr',
				dev,
				preprocess: autoPreprocess(),
			}),
			resolve({
				dedupe,
			}),
			commonjs(),
			typescript({ sourceMap: dev }),
			json(),
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules || Object.keys(process.binding('natives'))
		),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		],

		onwarn,
	}
};
