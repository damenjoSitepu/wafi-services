export namespace features {
  export type MinifiedData = {
    _id: string;
    fid: string;
    name?: string;
  };

  export type Data = {
    _id: string;
    fid: string;
    name: string;
    parent: string | null;
    isActive: boolean;
    childIds: string[];
  };
}