export interface GetEventDto {
  name: string;
  startup: boolean;
  dateTime: string;
}

export interface PostEventDto {
  startup: boolean;
  dateTime: string;
}

export interface HasConfigDto {
  hasConfig: boolean;
}
