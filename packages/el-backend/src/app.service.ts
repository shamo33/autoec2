import {
  DeleteRuleCommand,
  ListRulesCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import regexEscape from 'regex-escape';

import { ConfigProvider } from '#be/config.provider';
import { EventBridgeProvider } from '#be/eventbridge.provider';
import type { GetEventDto, HasConfigDto, PostEventDto } from '#types/dto/event';

const SCHEDULE_EXPRESSION_FORMAT = "'cron'(m H d M ? yyyy)";

@Injectable()
export class AppService {
  constructor(
    @Inject(ConfigProvider) private conf: ConfigProvider,
    @Inject(EventBridgeProvider) private client: EventBridgeProvider
  ) {}

  private static parseScheduleExpression(expression: string) {
    return DateTime.fromFormat(expression, SCHEDULE_EXPRESSION_FORMAT, {
      zone: 'UTC',
    });
  }

  private static createScheduleExpression(dateTime: DateTime) {
    return dateTime.setZone('UTC').toFormat(SCHEDULE_EXPRESSION_FORMAT);
  }

  private createRuleName(isStartup: boolean, dateTime: DateTime) {
    return `${this.conf.INSTANCE.aws.eventNamePrefix}-${dateTime.setZone('Asia/Tokyo').toFormat('yyyyMMddHHmm')}-${
      isStartup ? 'startup' : 'shutdown'
    }`;
  }

  private get regexEventName() {
    return new RegExp(
      `^${regexEscape(this.conf.INSTANCE.aws.eventNamePrefix)}-\\d{12}-(?:startup|shutdown)$`
    );
  }

  hasConfig() {
    return { hasConfig: !!this.conf.INSTANCE } as HasConfigDto;
  }

  async getEvents() {
    const res = await this.client.INSTANCE.send(
      new ListRulesCommand({
        EventBusName: 'default',
        NamePrefix: this.conf.INSTANCE.aws.eventNamePrefix,
      })
    );

    return res.Rules?.filter(
      (rule) =>
        rule.State === 'ENABLED' &&
        rule.RoleArn === this.conf.INSTANCE.aws.eventRoleArn &&
        this.regexEventName.test(rule.Name!)
    ).map((rule) => {
      return {
        name: rule.Name!,
        startup: rule.Name!.endsWith('-startup'),
        dateTime: AppService.parseScheduleExpression(rule.ScheduleExpression!)?.toISO(),
      } as GetEventDto;
    });
  }

  async postEvent(dto: PostEventDto) {
    const dateTime = DateTime.fromISO(dto.dateTime);
    const scheduleExpression = AppService.createScheduleExpression(dateTime);
    const name = this.createRuleName(dto.startup, dateTime);

    await this.client.INSTANCE.send(
      new PutRuleCommand({
        EventBusName: 'default',
        Name: name,
        ScheduleExpression: scheduleExpression,
        State: 'ENABLED',
        RoleArn: this.conf.INSTANCE.aws.eventRoleArn,
      })
    );
    await this.client.INSTANCE.send(
      new PutTargetsCommand({
        EventBusName: 'default',
        Rule: name,
        Targets: [
          {
            Id: 'target-ec2',
            Arn: `arn:aws:ssm:${this.conf.INSTANCE.aws.region}::automation-definition/AWS-${
              dto.startup ? 'Start' : 'Stop'
            }EC2Instance:$DEFAULT`,
            RoleArn: this.conf.INSTANCE.aws.eventRoleArn,
            Input: JSON.stringify({
              InstanceId: this.conf.INSTANCE.aws.instances,
              AutomationAssumeRole: [this.conf.INSTANCE.aws.automationRoleArn],
            }),
          },
          {
            Id: 'target-rule',
            Arn: `arn:aws:ssm:${this.conf.INSTANCE.aws.region}::automation-definition/AWS-DisableEventBridgeRule:$DEFAULT`,
            RoleArn: this.conf.INSTANCE.aws.eventRoleArn,
            Input: JSON.stringify({
              RuleName: [name],
              AutomationAssumeRole: [this.conf.INSTANCE.aws.automationRoleArn],
            }),
          },
        ],
      })
    );

    return {
      name,
      startup: dto.startup,
      dateTime: dateTime.toISO(),
    } as GetEventDto;
  }

  async deleteEvent(name: string) {
    await this.client.INSTANCE.send(
      new RemoveTargetsCommand({
        Rule: name,
        EventBusName: 'default',
        Ids: ['target-ec2', 'target-rule'],
      })
    );
    await this.client.INSTANCE.send(
      new DeleteRuleCommand({
        EventBusName: 'default',
        Name: name,
      })
    );

    return {};
  }
}
