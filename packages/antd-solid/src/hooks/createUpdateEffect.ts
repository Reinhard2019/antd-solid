import { createEffect, on } from 'solid-js'
import type { Accessor, AccessorArray, NoInfer, OnEffectFunction } from 'solid-js'

/**
 * 等同于 createEffect，但是会忽略首次执行，只在依赖更新时执行。
 */
export default function createUpdateEffect<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
) {
  createEffect(
    on(deps, fn, {
      defer: true,
    }),
  )
}
