/*
Manage all common interfaces
*/
export interface IConfigHeaders {
  tokenId: string;
  tokenBytes: Uint8Array;
  signatureVersion: string;
  signatureVersionBytes: Uint8Array;
  authorizationMode: string;
}

export interface _ITimeSeriesData {
  [key: string]: object[]; // Adjust `object` to the exact type of elements in the array if possible
}


export interface _errInterface{
  errorMessage: string
  reasonCode: string
}