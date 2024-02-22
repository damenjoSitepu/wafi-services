export namespace activityLogs {
  export type Request = {
    uid: string;
    subjectId: string;
    type: string;
    topic: string;
    message: string;
    routeToView: string;
    payloads: Array<Array<{ key: string, value: any }>>;
    prevLink?: string;
    nextLink?: string;
    navigationWorkflow: string[];
    createdAt: number;
    modifiedBeforeBy: {
      uid: string;
      name: string;
      email: string
    };
    modifiedAfterBy: {
      uid: string;
      name: string;
      email: string;
    }
  };

  export type Data = {
    uid: string;
    subjectId: string;
    type: string;
    topic: string;
    message: string;
    routeToView: string;
    payloads: Array<Array<{ key: string, value: any }>>;
    prevLink: string;
    nextLink: string;
    navigationWorkflow: string[];
    createdAt: number;
    modifiedBeforeBy: {
      uid: string;
      name: string;
      email: string
    };
    modifiedAfterBy: {
      uid: string;
      name: string;
      email: string;
    }
  };

  export type TimelineData = {
    uid: string;
    subjectId: string;
    createdAt: number;
    activityLogs: { _id: string, message: string, createdAt: number }[]
  };
}