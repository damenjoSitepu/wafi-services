export namespace activityLogs {
  export type Request = {
    uid: string;
    type: string;
    topic: string;
    message: string;
    routeToView: string;
    payloads: Array<Array<{ key: string, value: any }>>;
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
    type: string;
    topic: string;
    message: string;
    routeToView: string;
    payloads: Array<Array<{ key: string, value: any }>>;
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
}