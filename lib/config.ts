import fs = require('fs')
import yaml = require('js-yaml')
import events = require('@aws-cdk/aws-events')

const DEFAULT_IMAGE = 'maruware/radikocast'

type Day =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'everyday'
  | 'weekday'

const weekDayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
}

export class Schedule {
  public day: Day
  public startH: number
  public startM: number
  public endH: number
  public endM: number
  public station: string
  public at: string

  constructor(day: Day, at: string, station: string) {
    this.day = day
    this.station = station
    this.at = at
    this.parseAt(at)
  }

  public parseAt(at: string) {
    const [start, end] = at.split('-')
    const [startH, startM] = start.split(':')
    const [endH, endM] = end.split(':')
    this.startH = parseInt(startH)
    this.startM = parseInt(startM)
    this.endH = parseInt(endH)
    this.endM = parseInt(endM)
  }

  public recCron(): events.Schedule {
    const weekDay = this.cronWeekDay()

    // TODO: JST -> UTC

    return events.Schedule.cron({
      minute: (this.endM + 3).toString(),
      hour: ((this.endH - 9 + 24) % 24).toString(),
      month: '*',
      weekDay: weekDay
    })
  }

  public rssCron(): events.Schedule {
    const weekDay = this.cronWeekDay()

    // TODO: JST -> UTC

    return events.Schedule.cron({
      minute: (this.endM + 13).toString(),
      hour: ((this.endH - 9 + 24) % 24).toString(),
      month: '*',
      weekDay: weekDay
    })
  }

  private cronWeekDay() {
    switch (this.day) {
      case 'everyday':
        return '?'
      case 'weekday':
        return 'MON-FRI'
      default: {
        let n = weekDayMap[this.day]
        // UTC
        n += Math.floor((this.endH - 9) / 24)
        n = (n + 7) % 7
        n = n + 1 // CloudWatch Eventは1-7指定
        return n.toString()
      }
    }
  }
}

export default class Config {
  private _id: string
  private _title: string
  private _image: string
  private _bucketName: string
  private _schedules: Schedule[]

  constructor(
    id: string,
    title: string,
    image: string,
    bucketName: string,
    schedules: Schedule[]
  ) {
    this._id = id
    this._title = title
    this._image = image
    this._bucketName = bucketName
    this._schedules = schedules
  }

  static load(filepath: string): Config {
    const def = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))

    const c = new Config(
      def.id,
      def.title,
      def.image || DEFAULT_IMAGE,
      def.bucket_name,
      def.schedules.map((s: any) => new Schedule(s.day, s.at, s.station))
    )
    return c
  }

  get id() {
    return this._id
  }

  get title() {
    return this._title
  }

  get bucketName() {
    return this._bucketName
  }

  get schedules() {
    return this._schedules
  }

  get image() {
    return this._image
  }
}
