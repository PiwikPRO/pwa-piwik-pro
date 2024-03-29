import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';


// this override is needed because Module format cjs does not support top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

const globals = {
  ...packageJson.devDependencies,
};

export default {
  input: 'src/index.ts',
  output: [
    {
      file: '../../dist/pwa-piwik-pro/bundle.js',
      format: 'cjs', // commonJS
      sourcemap: 'inline',
    },
    {
      dir: '../../dist/pwa-piwik-pro',
      // file: 'dist',
      format: 'esm', // ES Modules
      sourcemap: false,
    },
  ],
  plugins: [
    peerDepsExternal(),
    nodeResolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        exclude: ['**/*.stories.*'],
      },
    }),
    commonjs({
      exclude: 'node_modules',
      ignoreGlobal: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    }),
  ],
  external: Object.keys(globals),
};
