import 'dayjs'

declare module 'dayjs' {
  export function dateDomain(list: ConfigType[]): Dayjs[]
  export function range(
    start: Dayjs,
    end: Dayjs,
    interval?: ManipulateType,
    d?: '()' | '[]' | '[)' | '(]',
  ): Dayjs[]
}
