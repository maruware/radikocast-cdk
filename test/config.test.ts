/* eslint-env jest */

import { Schedule } from '../lib/config'

test('cron', () => {
  const patterns: [Schedule, string][] = [
    [new Schedule('thursday', '13:42-14:38', 'LFR'), 'cron(43 5 ? * 5 *)'],
    [new Schedule('wednesday', '3:42-4:38', 'LFR'), 'cron(43 19 ? * 3 *)'],
    [new Schedule('wednesday', '0:00-01:00', 'LFR'), 'cron(5 16 ? * 3 *)'],
    [new Schedule('sunday', '3:42-4:38', 'LFR'), 'cron(43 19 ? * 7 *)'],
    [new Schedule('saturday', '27:42-28:38', 'LFR'), 'cron(43 19 ? * 7 *)']
  ]
  patterns.forEach(([schedule, expected]) => {
    expect(schedule.recCron().expressionString).toBe(expected)
  })
})
