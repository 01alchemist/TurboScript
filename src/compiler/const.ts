/**
 * Created by Nidin Vinayakan on 11/01/17.
 */
export const MIN_INT32_VALUE:number = -Math.pow(2,31);
export const MAX_INT32_VALUE:number = Math.pow(2,31) - 1;

export const MIN_UINT32_VALUE:number = 0;
export const MAX_UINT32_VALUE:number = Math.pow(2,32) - 1;

//FIXME: Cannot represent 64 bit integer in javascript
export const MIN_INT64_VALUE:number = -Math.pow(2,63);
export const MAX_INT64_VALUE:number = Math.pow(2,63) - 1;
export const MIN_UINT64_VALUE:number = 0;
export const MAX_UINT64_VALUE:number = Math.pow(2,64) - 1;