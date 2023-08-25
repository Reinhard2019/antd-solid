import ts from "rollup-plugin-typescript2"
import css from "rollup-plugin-import-css"
import commonjs from "@rollup/plugin-commonjs"
import { babel } from "@rollup/plugin-babel"

export default {
  input: "src/index.ts",
  output: {
    file: "es/index.js",
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
    css(),
  ],
  external: ["uno.css"],
}
