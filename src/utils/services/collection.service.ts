import CollectionContract from "@/utils/contracts/collection.contract";

class CollectionService implements CollectionContract {
  /**
   * Detach The Credential
   * 
   * @param {string[]} hiddenCols 
   * @param {T[]} items 
   * @returns {Omit<T, "_id">[]}
   */
  public detachCredential<T extends { _id?: any }>(hiddenCols: string[], items: T[]): Omit<T, "_id">[] {
    try {
      if (hiddenCols.length === 0) throw new Error();
      
      return items.length === 0 ? [] : items.map((props) => {
        const newObj: any = {};
        // @ts-ignore
        const objectProps = props.toObject();

        if (Object.keys(props).length > 0) {
          for (let key in objectProps) {
            try {
              if (hiddenCols.includes(key)) continue;
              newObj[key] = objectProps[key];
            } catch (e: any) {}
          }
        }

        return newObj;
      });
    } catch (e: any) {
      return [];
    }
  }
}

export default CollectionService;