import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import isBetween from 'dayjs/plugin/isBetween'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import dateDomain from './dateDomain'
import range from './range'
dayjs.extend(minMax)
dayjs.extend(isBetween)
dayjs.extend(quarterOfYear)
dayjs.extend(dateDomain)
dayjs.extend(range)

export default dayjs
