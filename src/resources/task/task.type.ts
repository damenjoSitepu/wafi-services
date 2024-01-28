export namespace task {
  export type Data = {
    _id: string;
    uid: string;
    name: string;
    order: number;
    createdAt: string;
  };

  export type Request = {
    name?: string;
    order?: number;
  };
};