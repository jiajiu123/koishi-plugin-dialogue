import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-dialogue'

declare module 'koishi-plugin-dialogue' {
  interface DialogueTest {
    matchTime?: number
    mismatchTime?: number
  }

  interface Dialogue {
    startTime: number
    endTime: number
  }

  namespace Dialogue {
    interface Options {
      startTime: string
      endTime: string
    }
  }
}

export function isHours(value: string) {
  if (!/^\d+(:\d+)?$/.test(value)) throw new Error('commands.teach.messages.time.invalid-input')
  const [_hours, _minutes = '0'] = value.split(':')
  const hours = +_hours, minutes = +_minutes
  if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return value
  throw new Error('commands.teach.messages.time.invalid-input')
}

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const name = 'koishi-plugin-dialogue-time'

export const using = ['database'] as const

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh'))

  ctx.model.extend('dialogue', {
    startTime: 'integer',
    endTime: 'integer',
  })

  /* eslint-disable no-irregular-whitespace */
  ctx.on('dialogue/usage', (output, session) => {
    output.add('　设置起始时间：　-t time', 450)
    output.add('　设置结束时间：　-T time', 450)
  })
  /* eslint-enable no-irregular-whitespace */

  ctx.command('teach')
    .option('startTime', '-t <time>', { type: isHours })
    .option('endTime', '-T <time>', { type: isHours })

  function parseTime(source: string) {
    const [hours, minutes = '0'] = source.split(':')
    return +hours * 60 + +minutes
  }

  ctx.before('dialogue/search', (session, test) => {
    const { options } = session.argv
    if (options.startTime !== undefined) test.matchTime = parseTime(options.startTime)
    if (options.endTime !== undefined) test.mismatchTime = parseTime(options.endTime)
  })

  ctx.on('dialogue/receive', (state) => {
    const date = new Date()
    state.test.matchTime = date.getHours() * 60 + date.getMinutes()
  })

  ctx.on('dialogue/modify', async (session, data) => {
    const { options } = session.argv

    if (options.startTime !== undefined) {
      data.startTime = parseTime(options.startTime)
    } else if (options.action === 'create') {
      data.startTime = 0
    }

    if (options.endTime !== undefined) {
      data.endTime = parseTime(options.endTime)
    } else if (options.action === 'create') {
      data.endTime = 0
    }
  })

  function formatTime(time: number) {
    const hours = Math.floor(time / 60)
    const minutes = time - hours * 60
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  ctx.on('dialogue/detail', (dialogue, detail, session) => {
    if (dialogue.startTime === dialogue.endTime) return
    detail.add(`${session.text('.time.detail')}${formatTime(dialogue.startTime)}-${formatTime(dialogue.endTime)}`, 800)
  })

  ctx.on('dialogue/abstract', (dialogue, output) => {
    if (dialogue.startTime === dialogue.endTime) return
    output.push(`${formatTime(dialogue.startTime)}-${formatTime(dialogue.endTime)}`)
  })

  const getRangeProduct = (time: number) => ({
    $multiply: [
      { $subtract: [{ $: 'endTime' }, { $: 'startTime' }] },
      { $subtract: [{ $: 'startTime' }, time] },
      { $subtract: [time, { $: 'endTime' }] },
    ],
  })

  ctx.on('dialogue/query', (test, query) => {
    if (test.matchTime !== undefined) {
      query.$and.push({ $expr: { $gte: [getRangeProduct(test.matchTime), 0] } as any })
    }
    if (test.mismatchTime !== undefined) {
      query.$and.push({ $expr: { $lt: [getRangeProduct(test.mismatchTime), 0] } as any })
    }
  })
}
