/**
 * Created by n.vinayakan on 06.06.17.
 */
export const isBrowser = new Function("try {return this===window;}catch(e){ return false;}")();
export const isNode = new Function("try {return this===global;}catch(e){return false;}")();