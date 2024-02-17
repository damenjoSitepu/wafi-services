export interface UtilServiceContract {
  /**
   * Convert JSON To Array Of Key And Values
   * 
   * @param {any} objects 
   * @returns {key: string, value: any[]}
   */
  convertJSONToArrayOfKeyAndValues(objects: any): { key: string, value: any }[];
}