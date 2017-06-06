/**
 * Created by n.vinayakan on 06.06.17.
 */
export function assert(truth) {
    if (!truth) {
        if(global["debug"]){
            debugger;
        }
        let error = new Error('Assertion failed');
        console.error(error);
        if(typeof process !== "undefined"){
            process.exit(1);
        } else{
            throw error;
        }
    }
}
