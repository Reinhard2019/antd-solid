import dayjs from 'dayjs'

export default (_, __, dayjsFactory: typeof dayjs) => {
  dayjsFactory.dateDomain = function (list: dayjs.ConfigType[]) {
    const dayjsList = list.map(v => dayjs(v))
    return [dayjs.min(dayjsList), dayjs.max(dayjsList)]
  }
}
