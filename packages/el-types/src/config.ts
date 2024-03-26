export interface Config {
  aws: AwsConfig;
}

export interface AwsConfig {
  profile: string;
  region: string;
  eventRoleArn: string;
  automationRoleArn: string;
  eventNamePrefix: string;
  instances: string[];
}
