/**
 * Created by n.vinayakan on 06.06.17.
 */
export const isBrowser = new Function("try {return this===window;}catch(e){ return false;}")();
export const isWorker = new Function("try {return this===self && typeof importScripts !== 'undefined';}catch(e){return false;}")();
export const isNode = typeof global !== "undefined" && typeof process !== "undefined" && typeof process.stdout !== "undefined";