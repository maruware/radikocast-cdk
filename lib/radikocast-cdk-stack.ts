import Config from './config'
import * as iam from '@aws-cdk/aws-iam'
import { SubnetType, Vpc } from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as ecs from '@aws-cdk/aws-ecs'
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'
import { sprintf } from 'sprintf-js'
export class RadikocastCdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    config: Config,
    props?: cdk.StackProps
  ) {
    // append id
    const id_ = `${id}-${config.id}`
    super(scope, id_, props)

    const cluster = this.createCluster()
    const taskDef = this.createTaskDef(config)

    this.createChannel(config, cluster, taskDef)
  }

  createCluster() {
    const vpc = new Vpc(this, 'vpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: SubnetType.PUBLIC
        }
      ]
    })
    return new ecs.Cluster(this, 'cluster', { vpc })
  }

  createTaskDef(config: Config) {
    const taskRoleIam = new iam.Role(this, 'ECS-S3 Role', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    })
    taskRoleIam.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess'
    })

    const taskDef = new ecs.FargateTaskDefinition(this, 'rec-rss', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: taskRoleIam
    })
    taskDef.addContainer('default', {
      image: ecs.ContainerImage.fromRegistry(config.image)
    })
    return taskDef
  }

  createChannel(
    config: Config,
    cluster: ecs.ICluster,
    taskDef: ecs.TaskDefinition
  ) {
    // s3
    const bucket = new s3.Bucket(this, `bucket-${config.id}`, {
      bucketName: config.bucketName,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html'
    })

    config.schedules.forEach((schedule, i) => {
      const cron = schedule.recCron()
      const ruleRec = new events.Rule(this, `${config.id}-${i}-rec`, {
        schedule: cron
      })
      ruleRec.addTarget(
        new targets.EcsTask({
          cluster,
          taskDefinition: taskDef,
          taskCount: 1,
          subnetSelection: {
            subnetType: SubnetType.PUBLIC
          },
          containerOverrides: [
            {
              containerName: 'default',
              command: [
                'rec_schedule',
                '-id',
                schedule.station,
                '-day',
                schedule.day,
                '-at',
                sprintf('%02d:%02d', schedule.startH, schedule.startM),
                '-bucket',
                bucket.bucketName,
                '-format',
                'm4a'
              ]
            }
          ]
        })
      )

      const ruleRss = new events.Rule(this, `${config.id}-${i}-rss`, {
        schedule: schedule.rssCron()
      })
      ruleRss.addTarget(
        new targets.EcsTask({
          cluster,
          taskDefinition: taskDef,
          taskCount: 1,
          subnetSelection: {
            subnetType: SubnetType.PUBLIC
          },
          containerOverrides: [
            {
              containerName: 'default',
              command: [
                'rss',
                '-title',
                config.title,
                '-host',
                `${bucket.bucketWebsiteUrl}`,
                '-feed',
                'feed.xml',
                '-bucket',
                bucket.bucketName
              ]
            }
          ]
        })
      )
    })
  }
}
