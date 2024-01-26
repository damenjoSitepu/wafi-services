class HttpException extends Error {
  /**
   * Request Status
   */
  private _status!: number;

  /**
   * Request Message
   */
  private _message!: string;

  /**
   * Initialize
   * 
   * @param {string} status 
   * @param {string} message 
   */
  public constructor(
    public status: number,
    public message: string 
  ) {
    super(message);
    this._status = status;
    this._message = message;
  }
}

export default HttpException;