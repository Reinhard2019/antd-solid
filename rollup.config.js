import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
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
      commonjs(),
      babel({
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        presets: ['babel-preset-solid'],
      }),
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
      babel({
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        presets: ['babel-preset-solid'],
      }),
      commonjs(),
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
        antd: 'Antd',
        react: 'React',
        'react-dom/client': 'ReactDOM',
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
      babel({
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        presets: ['babel-preset-solid'],
      }),
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      terser(),
      cleanup(),
    ],
    external: [
      'uno.css',
      'solid-js',
      'solid-js/web',
      'react',
      'react-dom/client',
      'antd',
      'nanoid',
      'lodash-es',
      'classnames',
    ],
  },
]
