interface CollectionContract {
  /**
   * Detach The Credential
   * 
   * @param {string[]} hiddenCols 
   * @param {T[]} items 
   * @returns {Omit<T, "_id">[]}
   */
  detachCredential<T extends { _id?: any }>(hiddenCols: string[], items: T[]): Omit<T, "_id">[];
}

export default CollectionContract;