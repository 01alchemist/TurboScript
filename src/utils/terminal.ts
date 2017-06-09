import {isNode} from "./env";
import {Color} from "./color";
/**
 * Created by n.vinayakan on 06.06.17.
 */
export class Terminal {

    static silent: boolean = false;
    static history: string = "";

    static write(text) {
        Terminal.history += text;
        if (Terminal.silent) {
            return;
        }
        if (isNode) {
            process.stdout.write(text);
        } else {
            console.log(text);
        }
    }

    static time(name: string) {
        if (!Terminal.silent) {
            console.time(name);
        }
    }

    static timeEnd(name: string) {
        if (!Terminal.silent) {
            console.timeEnd(name);
        }
    }

    static setBGColor(color) {
        if (isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write(`\x1B[48;5;${color === null ? "" : color}m`);
            }
        } else {
            // TODO
        }
    }

    static setTextColor(color) {
        if (isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write(`\x1B[38;5;${color}m`);
            }
        } else {
            // TODO
        }
    }

    static setBoldText() {
        if (isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write(`\x1B[38;1m`);
            }
        } else {
            // TODO
        }
    }

    static clearColor() {
        if (isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write(`\x1B[0m`);
            }
        } else {
            // TODO
        }
    }

    static error(text: Error | string) {
        Terminal.setBGColor(Color.RED);
        Terminal.setTextColor(Color.WHITE);
        Terminal.write(" ERROR ");
        Terminal.clearColor();
        Terminal.setTextColor(Color.RED);
        Terminal.write(" ");
        Terminal.write(text);
        Terminal.write("\n");
        Terminal.clearColor();
    }

    static warn(text: string) {
        Terminal.setBGColor(Color.ORANGE);
        Terminal.setTextColor(Color.WHITE);
        Terminal.write(" WARN ");
        Terminal.clearColor();
        Terminal.setTextColor(Color.ORANGE);
        Terminal.write(" ");
        Terminal.write(text);
        Terminal.write("\n");
        Terminal.clearColor();
    }
}