export namespace features {
  export type MinifiedData = {
    _id: string;
    fid: string;
    name?: string;
    parent: string;
  };

  export type Data = {
    _id: string;
    fid: string;
    name: string;
    parent: string | null;
    isActive: boolean;
    childIds: string[];
    allChildIds: string[];
  };

  export type DashboardData = {
    _id: string;
    uid: string;
    fdid: string;
    key: string;
    title: string;
    value: number;
    createdAt: number;
    updatedAt: number;
  };

  export type SettingDashboardRequest = {
    key: string;
    title: string;
    isInc: boolean;
    value: number;
  };
}