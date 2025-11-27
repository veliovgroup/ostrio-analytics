import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const input = 'src/index.ts';
const umdInput = 'src/umd.ts';
const banner = '/*! ostrio-analytics v2.0.0 | BSD-3-Clause */';

const basePlugins = [
  resolve({ browser: true, preferBuiltins: false }),
  commonjs(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  })
];

export default [{
  input,
  output: { file: 'dist/index.js', format: 'esm', sourcemap: true, banner },
  plugins: [
    ...basePlugins,
    typescript({ compilerOptions: { target: 'ES2022', module: 'ESNext' } })
    // esbuild({ target: 'es2022', platform: 'browser', sourceMap: true, minify: false })
  ],
  treeshake: true
}, {
  input,
  output: { file: 'dist/index.cjs', format: 'cjs', exports: 'named', sourcemap: true, banner },
  plugins: [
    ...basePlugins,
    typescript({ compilerOptions: { target: 'ES2020', module: 'ESNext' } })
    // esbuild({ target: 'es2020', platform: 'browser', sourceMap: true, minify: false })
  ],
  treeshake: true
}, {
  input: umdInput,
  output: {
    file: 'dist/ostrio-analytics.umd.js',
    format: 'umd',
    name: 'OstrioTrackerClass',
    exports: 'default',
    sourcemap: true,
    banner
  },
  plugins: [
    ...basePlugins,
    typescript({
      compilerOptions: {
        target: 'ES5',
        module: 'ESNext',
        lib: ['DOM', 'ES5', 'ES2015.Iterable'],
        downlevelIteration: true,
        importHelpers: true
      }
    })
  ],
  treeshake: true
}, {
  input: umdInput,
  output: {
    file: 'dist/ostrio-analytics.min.js',
    format: 'umd',
    name: 'OstrioTrackerClass',
    exports: 'default',
    sourcemap: true,
    banner
  },
  plugins: [
    ...basePlugins,
    typescript({
      compilerOptions: {
        target: 'ES5',
        module: 'ESNext',
        lib: ['DOM', 'ES5', 'ES2015.Iterable'],
        downlevelIteration: true,
        importHelpers: true
      }
    }),
    terser({ format: { comments: /^!/ } })
  ],
  treeshake: true
}];
