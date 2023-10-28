import ts from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import { babel } from "@rollup/plugin-babel"
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
    },
    plugins: [
      ts({
        tsconfig: "./tsconfig.json",
        // include: "src/**/*.ts+(|x)",
        exclude: ["**/*.test.[ts|tsx]"],
      }),
      babel({
        extensions: [".js", ".ts", ".jsx", ".tsx"],
        presets: ["babel-preset-solid"],
      }),
      commonjs(),
    ],
    external: ["uno.css"],
  },
  {
    input: "src/index.ts",
    output: {
      name: 'AntdSolid',
      file: "dist/index.umd.js",
      format: 'umd',
      globals: {
        'solid-js': 'SolidJs',
        'solid-js/web': 'SolidJsWeb',
        antd: 'Antd',
        react: 'React',
        'react-dom/client': 'ReactDOM',
        'nanoid': 'Nanoid',
        'classnames': 'Classnames',
        'lodash-es': 'Lodash',
      },
    },
    context: 'window',
    plugins: [
      ts({
        tsconfig: "./tsconfig.json",
        // include: "src/**/*.ts+(|x)",
        exclude: ["**/*.test.[ts|tsx]"],
      }),
      babel({
        extensions: [".js", ".ts", ".jsx", ".tsx"],
        presets: ["babel-preset-solid"],
      }),
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      terser(),
      cleanup(),
    ],
    external: ["uno.css", 'solid-js', 'solid-js/web', 'react', 'react-dom/client', 'antd', 'nanoid', 'lodash-es', 'classnames'],
  }
]
