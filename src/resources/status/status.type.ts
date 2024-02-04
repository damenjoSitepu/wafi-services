export namespace status {
  export type Data = {
    _id: string;
    uid: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
  };

  export type Request = {
    name?: string;
    description?: string;
    color?: string;
  };
};