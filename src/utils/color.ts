/**
 * Created by n.vinayakan on 06.06.17.
 */
export const Color = {
    DEFAULT_TEXT: 12,
    DEFAULT_BG: 8,
    BLACK: 0,
    WHITE: 255,
    BOLD: 1,
    RED: 1,
    GREEN: 2,
    YELLOW: 3,
    BLUE: 4,
    MAGENTA: 5,
    ORANGE: 208,
};

const hexColor = {};
hexColor[Color.DEFAULT_TEXT] = "#000000";
hexColor[Color.DEFAULT_BG] = "#FFFFFF";
hexColor[Color.BLACK] = "#000000";
hexColor[Color.WHITE] = "#FFFFFF";
hexColor[Color.BOLD] = "";
hexColor[Color.RED] = "#FF0000";
hexColor[Color.GREEN] = "#00FF00";
hexColor[Color.BLUE] = "#0000FF";
hexColor[Color.YELLOW] = "#FFF600";
hexColor[Color.MAGENTA] = "#FF00FF";
hexColor[Color.ORANGE] = "#FF8C00";
export const HexColor = hexColor;
