import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import postcss from 'rollup-plugin-postcss'
import fs from 'fs'
import path from 'path'

function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(item => {
    var fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) //递归读取文件
    } else {
      filesList.push(fullPath)
    }
  })
  return filesList
}

const filesList = readFileList('./src')

const commonPlugins = [
  commonjs(),
  babel({
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    presets: ['babel-preset-solid'],
  }),
  postcss({
    extract: false,
    use: ['sass'],
  }),
]

export default [
  {
    input: filesList.filter(fileName => /^(?!.*\.d).*\.tsx?$/.test(fileName)),
    output: {
      dir: 'es',
      format: 'esm',
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [
      ts({
        tsconfig: 'tsconfig.components.json',
        exclude: ['src/**/*.test.ts'],
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
        },
      }),
      ...commonPlugins,
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
    },
    plugins: [
      ts({
        tsconfig: 'tsconfig.components.json',
        // include: "src/**/*.ts+(|x)",
        exclude: ['**/*.test.[ts|tsx]'],
      }),
      ...commonPlugins,
    ],
    external: ['uno.css'],
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'AntdSolid',
      file: 'dist/index.umd.js',
      format: 'umd',
      globals: {
        'solid-js': 'SolidJs',
        'solid-js/web': 'SolidJsWeb',
        nanoid: 'Nanoid',
        classnames: 'Classnames',
        'lodash-es': 'Lodash',
      },
    },
    context: 'window',
    plugins: [
      ts({
        tsconfig: 'tsconfig.components.json',
        // include: "src/**/*.ts+(|x)",
        exclude: ['**/*.test.[ts|tsx]'],
      }),
      nodeResolve({
        browser: true,
      }),
      ...commonPlugins,
      terser(),
      cleanup(),
    ],
    external: ['uno.css', 'solid-js', 'solid-js/web', 'antd', 'nanoid', 'lodash-es', 'classnames'],
  },
]
