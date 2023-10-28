/**
 * 取消注释 Code 组件中的 Non-production 代码
 */
import path from 'path'
import fs from 'fs'

const codeComponentPath = path.resolve('docs/.vitepress/components/Code.vue')

fs.readFile(codeComponentPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  const reg = /(\/\/ Non-production code start\n)([\s\S]*)(\n.*\/\/ Non-production code end)/
  const match = data.match(reg)
  const annotation = match[2]
    .split('\n')
    .map(s => s.replace('// ', ''))
    .join('\n')
  const newData = data.replace(reg, `$1${annotation}$3`)

  fs.writeFile(codeComponentPath, newData, err => {
    if (err) {
      console.error(err)
      return
    }
  })
})
console.log('codeComponentPathpath', codeComponentPath)
