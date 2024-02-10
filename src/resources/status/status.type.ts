export namespace status {
  export type Data = {
    _id: string;
    uid: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
  };

  export type MinifiedData = {
    _id: string;
    name: string;
    color: string;
  }

  export type Request = {
    name?: string;
    description?: string;
    color?: string;
  };
};