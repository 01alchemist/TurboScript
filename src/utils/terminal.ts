import {isNode} from "./env";
import {Color} from "./color";
/**
 * Created by n.vinayakan on 06.06.17.
 */
export class Terminal {

    static write(text) {
        if (isNode) {
            process.stdout.write(text);
        } else {
            console.log(text);
        }
    }

    static setColor(color) {
        if (isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write('\x1B[0;' + color + 'm');
            }
        } else {

        }
    }

}