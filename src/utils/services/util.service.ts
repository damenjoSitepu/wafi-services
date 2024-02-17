import { UtilServiceContract } from "@/utils/contracts/util-service.contract";

class UtilService implements UtilServiceContract {
  /**
   * Convert JSON To Array Of Key And Values
   * 
   * @param {any} objects 
   * @returns {key: string, value: any[]}
   */
  public convertJSONToArrayOfKeyAndValues(objects: any): { key: string, value: any }[] {
    try {
      if (!objects) {
        return [];
      }

      const arrays: { key: string, value: any }[] = [];
      for (let key in objects) {
        try {
          arrays.push({ key, value: objects[key] });
        } catch (e: any) {}
      }

      return arrays;
    } catch (e: any) {
      return [];
    }
  }
}

export default UtilService;