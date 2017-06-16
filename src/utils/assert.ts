import {Terminal} from "./terminal";
import {Compiler} from "../compiler/compiler";
/**
 * Created by n.vinayakan on 06.06.17.
 */
export function assert(truth) {
    if (!truth) {
        debugger;
        Terminal.error('Assertion failed');
        if(typeof process !== "undefined"){
            process.exit(1);
        } else{
            throw 'Assertion failed';
        }
    }
}
