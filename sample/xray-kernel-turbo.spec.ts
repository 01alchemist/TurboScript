///<reference path="./xray-kernel-turbo.ts" />
import kernel = require("./xray-kernel-turbo");

const turbo = kernel.turbo;
const Color = kernel.Color;
const Vector = kernel.Vector;
const Matrix = kernel.Matrix;

describe("Turbo Runtime suite", () => {

    it("Turbo should have defined", () => {
        expect(turbo).toBeDefined();
    });

    it("Turbo Runtime should have defined", () => {
        expect(turbo.Runtime).toBeDefined();
    });

});
describe("Kernel suite >> ", () => {

    it("Kernel should have defined", () => {
        expect(kernel).toBeDefined();
    });

    describe("Color definition >> ", () => {

        it("Color should have defined", () => {
            expect(Color).toBeDefined();
        });

        it("Color should have init method", () => {
            expect(Color.init).toBeDefined();
        });

        it("Color should have Set method", () => {
            expect(Color.Set).toBeDefined();
        });

        it("Color should have HexColor method", () => {
            expect(Color.HexColor).toBeDefined();
        });

        it("Color should have kelvin method", () => {
            expect(Color.Kelvin).toBeDefined();
        });

        it("Color should have NewColor method", () => {
            expect(Color.NewColor).toBeDefined();
        });

        it("Color should have RGBA method", () => {
            expect(Color.RGBA).toBeDefined();
        });

        it("Color should have RGBA64 method", () => {
            expect(Color.RGBA64).toBeDefined();
        });
        it("Color should have Add method", () => {
            expect(Color.Add).toBeDefined();
        });

        it("Color should have Add_mem method", () => {
            expect(Color.Add_mem).toBeDefined();
        });

        it("Color should have Sub method", () => {
            expect(Color.Sub).toBeDefined();
        });

        it("Color should have Sub_mem method", () => {
            expect(Color.Sub_mem).toBeDefined();
        });

        it("Color should have Mul method", () => {
            expect(Color.Mul).toBeDefined();
        });

        it("Color should have Mul_mem method", () => {
            expect(Color.Mul_mem).toBeDefined();
        });

        it("Color should have MulScalar method", () => {
            expect(Color.MulScalar).toBeDefined();
        });

        it("Color should have MulScalar_mem method", () => {
            expect(Color.MulScalar_mem).toBeDefined();
        });

        it("Color should have DivScalar method", () => {
            expect(Color.DivScalar).toBeDefined();
        });

        it("Color should have DivScalar_mem method", () => {
            expect(Color.DivScalar_mem).toBeDefined();
        });

        it("Color should have Min method", () => {
            expect(Color.Min).toBeDefined();
        });

        it("Color should have Min_mem method", () => {
            expect(Color.Min_mem).toBeDefined();
        });

        it("Color should have Max method", () => {
            expect(Color.Max).toBeDefined();
        });

        it("Color should have Max_mem method", () => {
            expect(Color.Max_mem).toBeDefined();
        });

        it("Color should have MinComponent method", () => {
            expect(Color.MinComponent).toBeDefined();
        });

        it("Color should have MinComponent_mem method", () => {
            expect(Color.MinComponent_mem).toBeDefined();
        });

        it("Color should have MaxComponent method", () => {
            expect(Color.MaxComponent).toBeDefined();
        });

        it("Color should have MaxComponent_mem method", () => {
            expect(Color.MaxComponent_mem).toBeDefined();
        });

        it("Color should have Pow method", () => {
            expect(Color.Pow).toBeDefined();
        });

        it("Color should have Pow_mem method", () => {
            expect(Color.Pow_mem).toBeDefined();
        });

        it("Color should have Mix method", () => {
            expect(Color.Mix).toBeDefined();
        });

        it("Color should have Mix_mem method", () => {
            expect(Color.Mix_mem).toBeDefined();
        });

        it("Color should have Clone method", () => {
            expect(Color.Clone).toBeDefined();
        });

        it("Color should have Random method", () => {
            expect(Color.Random).toBeDefined();
        });

        it("Color should have RandomBrightColor method", () => {
            expect(Color.RandomBrightColor).toBeDefined();
        });

        it("Color should have BrightColors property", () => {
            expect(Color.BrightColors).toBeDefined();
        });
    });

    describe("Color instance >> ", () => {

        it("Should create without a problem", () => {
            let color = new Color(0);
            expect(color).toBeTruthy();
        });

        it("Should add without a problem", () => {

            //float64 (input)
            let red = {R: 1, G: 0, B: 0};
            let green = {R: 0, G: 1, B: 0};
            let blue = {R: 0, G: 0, B: 1};

            //uint8 (output)
            let white = {R: 255, G: 255, B: 255, A: 255};

            let _red:number = Color.NewColor(red);
            let _green:number = Color.NewColor(green);
            let _blue:number = Color.NewColor(blue);
            let result1:number = Color.NewColor();

            let tmp1:number = Color.Add_mem(_red, _green);

            Color.Add_mem(tmp1, _blue, result1);

            let result2:number = Color.Add_mem(tmp1, _blue);

            expect(white).toEqual(Color.RGBA(result1));
            expect(white).toEqual(Color.RGBA(result2));
        });

        it("Should subtract without a problem", () => {

            //float64 (input)
            let white = {R: 1, G: 1, B: 1};
            let green = {R: 0, G: 1, B: 0};
            let blue = {R: 0, G: 0, B: 1};

            //uint8 (output)
            let red = {R: 255, G: 0, B: 0, A: 255};

            let _white:number = Color.NewColor(white);
            let _green:number = Color.NewColor(green);
            let _blue:number = Color.NewColor(blue);
            let result1:number = Color.NewColor();

            let tmp1:number = Color.Sub_mem(_white, _blue);

            Color.Sub_mem(tmp1, _green, result1);

            let result2 = Color.Sub_mem(tmp1, _green);

            expect(red).toEqual(Color.RGBA(result1));
            expect(red).toEqual(Color.RGBA(result2));
        });

        it("Should multiply without a problem", () => {

            //float64 (input)
            let red = {R: 1, G: 0, B: 0};
            let green = {R: 0, G: 1, B: 0};
            let blue = {R: 0, G: 0, B: 1};

            //uint8 (output)
            let black = {R: 0, G: 0, B: 0, A: 255};

            let _red:number = Color.NewColor(red);
            let _green:number = Color.NewColor(green);
            let _blue:number = Color.NewColor(blue);
            let result1:number = Color.NewColor();

            let tmp1:number = Color.Mul_mem(_red, _green);

            Color.Mul_mem(tmp1, _blue, result1);

            let result2:number = Color.Mul_mem(tmp1, _blue);

            expect(black).toEqual(Color.RGBA(result1));
            expect(black).toEqual(Color.RGBA(result2));
        });

        it("Should multiply scalar without a problem", () => {

            //float64 (input)
            let white = {R: 1, G: 1, B: 1};

            //uint8 (output)
            let halfwhite = {R: Math.round(255 * 0.5), G: Math.round(255 * 0.5), B: Math.round(255 * 0.5), A: 255};
            let halfwhiteFloat = {R: 0.5, G: 0.5, B: 0.5, A: 1.0};

            let _white:number = Color.NewColor(white);
            let result1:number = Color.NewColor();

            Color.MulScalar_mem(_white, 0.5, result1);

            let result2:number = Color.MulScalar_mem(_white, 0.5);
            let result3:number = Color.MulScalar_mem(_white, 0.5000000000000001);


            expect(halfwhite).toEqual(Color.RGBA(result1));
            expect(halfwhite).toEqual(Color.RGBA(result2));
            expect(halfwhiteFloat).not.toEqual(Color.FloatRGBA(result3));
        });

        it("Should divide scalar without a problem", () => {

            //float64 (input)
            let white = {R: 1, G: 1, B: 1};

            //uint8 (output)
            let halfwhite = {R: Math.round(255 * 0.5), G: Math.round(255 * 0.5), B: Math.round(255 * 0.5), A: 255};

            let _white:number = Color.NewColor(white);
            let result1:number = Color.NewColor();

            Color.DivScalar_mem(_white, 2, result1);

            let result2:number = Color.DivScalar_mem(_white, 2);


            expect(halfwhite).toEqual(Color.RGBA(result1));
            expect(halfwhite).toEqual(Color.RGBA(result2));
        });

        it("Should calculate minimum value without a problem", () => {

            //float64 (input)
            let color1 = {R: 1, G: 0.00055, B: 0.0255};
            let color2 = {R: 0.25, G: 0.5, B: 0.05};

            let min = {R: 0.25, G: 0.00055, B: 0.0255, A: 1};

            let _c1:number = Color.NewColor(color1);
            let _c2:number = Color.NewColor(color2);

            let result1:number = Color.NewColor();

            Color.Min_mem(_c1, _c2, result1);

            let result2:number = Color.Min_mem(_c1, _c2);


            expect(min).toEqual(Color.FloatRGBA(result1));
            expect(min).toEqual(Color.FloatRGBA(result2));
        });

        it("Should calculate maximum value without a problem", () => {

            //float64 (input)
            let color1 = {R: 1, G: 0.00055, B: 0.0255};
            let color2 = {R: 0.25, G: 0.5, B: 0.05};

            let max = {R: 1, G: 0.5, B: 0.05, A: 1};

            let _c1:number = Color.NewColor(color1);
            let _c2:number = Color.NewColor(color2);

            let result1:number = Color.NewColor();

            Color.Max_mem(_c1, _c2, result1);

            let result2:number = Color.Max_mem(_c1, _c2);


            expect(max).toEqual(Color.FloatRGBA(result1));
            expect(max).toEqual(Color.FloatRGBA(result2));
        });

        it("Should calculate minimum component without a problem", () => {

            //float64 (input)
            let color1 = {R: 1, G: 0.00055, B: 0.0255};

            let _c1:number = Color.NewColor(color1);

            let result:number = Color.MinComponent_mem(_c1);


            expect(result).toEqual(0.00055);
        });

        it("Should calculate maximum component without a problem", () => {

            //float64 (input)
            let color1 = {R: 1, G: 0.00055, B: 0.0255};

            let _c1:number = Color.NewColor(color1);

            let result:number = Color.MaxComponent_mem(_c1);


            expect(result).toEqual(1);
        });

        it("Should calculate power without a problem", () => {

            let factor:number = 2;
            //float64 (input)
            let color = {R: 1, G: 0.00055, B: 0.0255};
            let color_pow = {
                R: Math.pow(color.R, factor),
                G: Math.pow(color.G, factor),
                B: Math.pow(color.B, factor),
                A: 1.0
            };

            let _c1:number = Color.NewColor(color);

            let result:number = Color.Pow_mem(_c1, factor);

            expect(Color.FloatRGBA(result)).toEqual(color_pow);
        });

        it("Should mix without a problem", () => {

            let factor:number = 0.5;
            //float64 (input)
            let color1 = {R: 1, G: 0, B: 0.0255};
            let color2 = {R: 1, G: 1, B: 0.0255};

            let color_mix = {R: 1, G: 0.5, B: 0.0255, A: 1};

            let _c1:number = Color.NewColor(color1);
            let _c2:number = Color.NewColor(color2);

            let result1:number = Color.NewColor();
            Color.Mix_mem(_c1, _c2, factor, result1);

            let result2:number = Color.Mix_mem(_c1, _c2, factor);

            expect(Color.FloatRGBA(result1)).toEqual(color_mix);
            expect(Color.FloatRGBA(result2)).toEqual(color_mix);
        });

        it("Should check IsEqual without a problem", () => {

            //float64 (input)
            let color1 = {R: 0.256, G: 0, B: 1};
            let color2 = {R: 0.256, G: 0, B: 1};
            let color3 = {R: 0.254, G: 1, B: 0.0255};

            let _c1:number = Color.NewColor(color1);
            let _c2:number = Color.NewColor(color2);
            let _c3:number = Color.NewColor(color3);

            let result1:boolean = Color.IsEqual(_c1, _c2);
            let result2:boolean = Color.IsEqual(_c2, _c1);
            let result3:boolean = Color.IsEqual(_c1, _c3);
            let result4:boolean = Color.IsEqual(_c2, _c3);

            expect(result1).toBeTruthy();
            expect(result2).toBeTruthy();
            expect(result3).not.toBeTruthy();
            expect(result4).not.toBeTruthy();
        });

        it("Should check IsBlack without a problem", () => {

            //float64 (input)
            let black = {R: 0, G: 0, B: 0};
            let blue = {R: 0, G: 0, B: 1};

            let _c1:number = Color.NewColor(black);
            let _c2:number = Color.NewColor(blue);

            let result1:boolean = Color.IsBlack(_c1);
            let result2:boolean = Color.IsBlack(_c2);

            expect(result1).toBeTruthy();
            expect(result2).not.toBeTruthy();
        });

        it("Should check IsWhite without a problem", () => {

            //float64 (input)
            let white = {R: 1, G: 1, B: 1};
            let blue = {R: 0, G: 0, B: 1};

            let _c1:number = Color.NewColor(white);
            let _c2:number = Color.NewColor(blue);

            let result1:boolean = Color.IsWhite(_c1);
            let result2:boolean = Color.IsWhite(_c2);

            expect(result1).toBeTruthy();
            expect(result2).not.toBeTruthy();
        });

        it("Should set value without a problem", () => {

            //float64 (input)
            let blue = {R: 0, G: 0, B: 1, A: 1};

            let _c:number = Color.NewColor();

            let result:number = Color.Set(_c, blue.R, blue.G, blue.B);

            expect(Color.FloatRGBA(result)).toEqual(blue);
        });

        it("Should clone without a problem", () => {

            //float64 (input)
            let blue = {R: 0, G: 0, B: 1, A: 1};

            let _c:number = Color.NewColor(blue);

            let result:number = Color.Clone(_c);

            expect(Color.FloatRGBA(result)).toEqual(blue);
        });

        it("Should create random color without a problem", () => {

            let color1:number = Color.Random();
            let color2:number = Color.Random();
            expect(color1).not.toBeNull();
            expect(color2).not.toBeNull();
            expect(Color.RGBA(color1)).not.toBeNull();
            expect(Color.RGBA(color2)).not.toBeNull();
            expect(Color.RGBA(color1)).not.toEqual(Color.RGBA(color2));
        });

        it("Should create random bright color without a problem", () => {

            let color1:number = Color.RandomBrightColor();
            let color2:number = Color.RandomBrightColor();
            expect(color1).not.toBeNull();
            expect(color2).not.toBeNull();
            expect(Color.RGBA(color1)).not.toBeNull();
            expect(Color.RGBA(color2)).not.toBeNull();
        });
    });

    describe("Vector definition >> ", () => {

        it("Vector should have defined", () => {
            expect(Vector).toBeDefined();
        });

        it("Vector should have RandomUnitVector method", () => {
            expect(Vector.RandomUnitVector).toBeDefined();
        });

        it("Vector should have Length method", () => {
            expect(Vector.Length).toBeDefined();
        });

        it("Vector should have LengthN method", () => {
            expect(Vector.LengthN).toBeDefined();
        });

        it("Vector should have Dot method", () => {
            expect(Vector.Dot).toBeDefined();
        });

        it("Vector should have Dot_mem method", () => {
            expect(Vector.Dot_mem).toBeDefined();
        });

        it("Vector should have Cross method", () => {
            expect(Vector.Cross).toBeDefined();
        });

        it("Vector should have Cross_mem method", () => {
            expect(Vector.Cross_mem).toBeDefined();
        });

        it("Vector should have Normalize method", () => {
            expect(Vector.Normalize).toBeDefined();
        });

        it("Vector should have Normalize_mem method", () => {
            expect(Vector.Normalize_mem).toBeDefined();
        });

        it("Vector should have Negate method", () => {
            expect(Vector.Negate).toBeDefined();
        });

        it("Vector should have Negate_mem method", () => {
            expect(Vector.Negate_mem).toBeDefined();
        });

        it("Vector should have Abs method", () => {
            expect(Vector.Abs).toBeDefined();
        });

        it("Vector should have Abs_mem method", () => {
            expect(Vector.Abs_mem).toBeDefined();
        });

        it("Vector should have Add method", () => {
            expect(Vector.Add).toBeDefined();
        });

        it("Vector should have Add_mem method", () => {
            expect(Vector.Add_mem).toBeDefined();
        });

        it("Vector should have Sub method", () => {
            expect(Vector.Sub).toBeDefined();
        });

        it("Vector should have Sub_mem method", () => {
            expect(Vector.Sub_mem).toBeDefined();
        });

        it("Vector should have Mul method", () => {
            expect(Vector.Mul).toBeDefined();
        });

        it("Vector should have Mul_mem method", () => {
            expect(Vector.Mul_mem).toBeDefined();
        });

        it("Vector should have Div method", () => {
            expect(Vector.Div).toBeDefined();
        });

        it("Vector should have Div_mem method", () => {
            expect(Vector.Div_mem).toBeDefined();
        });

        it("Vector should have Mod method", () => {
            expect(Vector.Mod).toBeDefined();
        });

        it("Vector should have Mod_mem method", () => {
            expect(Vector.Mod_mem).toBeDefined();
        });

        it("Vector should have AddScalar method", () => {
            expect(Vector.AddScalar).toBeDefined();
        });

        it("Vector should have AddScalar_mem method", () => {
            expect(Vector.AddScalar_mem).toBeDefined();
        });

        it("Vector should have SubScalar method", () => {
            expect(Vector.SubScalar).toBeDefined();
        });

        it("Vector should have SubScalar_mem method", () => {
            expect(Vector.SubScalar_mem).toBeDefined();
        });

        it("Vector should have MulScalar method", () => {
            expect(Vector.MulScalar).toBeDefined();
        });

        it("Vector should have MulScalar_mem method", () => {
            expect(Vector.MulScalar_mem).toBeDefined();
        });

        it("Vector should have DivScalar method", () => {
            expect(Vector.DivScalar).toBeDefined();
        });

        it("Vector should have DivScalar_mem method", () => {
            expect(Vector.DivScalar_mem).toBeDefined();
        });

        it("Vector should have Min method", () => {
            expect(Vector.Min).toBeDefined();
        });

        it("Vector should have Min_mem method", () => {
            expect(Vector.Min_mem).toBeDefined();
        });

        it("Vector should have Max method", () => {
            expect(Vector.Max).toBeDefined();
        });

        it("Vector should have Max_mem method", () => {
            expect(Vector.Max_mem).toBeDefined();
        });

        it("Vector should have MinAxis method", () => {
            expect(Vector.MinAxis).toBeDefined();
        });

        it("Vector should have MinAxis_mem method", () => {
            expect(Vector.MinAxis_mem).toBeDefined();
        });

        it("Vector should have MinComponent method", () => {
            expect(Vector.MinComponent).toBeDefined();
        });

        it("Vector should have MinComponent_mem method", () => {
            expect(Vector.MinComponent_mem).toBeDefined();
        });

        it("Vector should have MaxComponent method", () => {
            expect(Vector.MaxComponent).toBeDefined();
        });

        it("Vector should have MaxComponent_mem method", () => {
            expect(Vector.MaxComponent_mem).toBeDefined();
        });

        it("Vector should have Reflect method", () => {
            expect(Vector.Reflect).toBeDefined();
        });

        it("Vector should have Reflect_mem method", () => {
            expect(Vector.Reflect_mem).toBeDefined();
        });

        it("Vector should have Refract method", () => {
            expect(Vector.Refract).toBeDefined();
        });

        it("Vector should have Refract_mem method", () => {
            expect(Vector.Refract_mem).toBeDefined();
        });

        it("Vector should have Reflectance method", () => {
            expect(Vector.Reflectance).toBeDefined();
        });

        it("Vector should have Reflectance_mem method", () => {
            expect(Vector.Reflectance_mem).toBeDefined();
        });

    })

    describe("Vector instance >> ", () => {

        it("Should create without a problem", () => {
            let vector = new Vector(0);
            expect(vector).toBeTruthy();
        });

        it("Should add without a problem", () => {

            //float64 (input)
            let a1 = {X: 1, Y: 0, Z: 0};
            let a2 = {X: 0, Y: 1, Z: 0};
            let a3 = {X: 0, Y: 0, Z: 1};

            //uint8 (output)
            let a4 = {X: 1, Y: 1, Z: 1};

            let _red:number = Vector.NewVector(a1);
            let _green:number = Vector.NewVector(a2);
            let _blue:number = Vector.NewVector(a3);
            let result1:number = Vector.NewVector();

            let tmp1:number = Vector.Add_mem(_red, _green);

            Vector.Add_mem(tmp1, _blue, result1);

            let result2:number = Vector.Add_mem(tmp1, _blue);

            expect(a4).toEqual(Vector.XYZ(result1));
            expect(a4).toEqual(Vector.XYZ(result2));
        });

        it("Should subtract without a problem", () => {

            //float64 (input)
            let white = {X: 1, Y: 1, Z: 1};
            let a2 = {X: 0, Y: 1, Z: 0};
            let a3 = {X: 0, Y: 0, Z: 1};

            //uint8 (output)
            let a1 = {X: 1, Y: 0, Z: 0};

            let _white:number = Vector.NewVector(white);
            let _green:number = Vector.NewVector(a2);
            let _blue:number = Vector.NewVector(a3);
            let result1:number = Vector.NewVector();

            let tmp1:number = Vector.Sub_mem(_white, _blue);

            Vector.Sub_mem(tmp1, _green, result1);

            let result2 = Vector.Sub_mem(tmp1, _green);

            expect(a1).toEqual(Vector.XYZ(result1));
            expect(a1).toEqual(Vector.XYZ(result2));
        });

        it("Should multiply without a problem", () => {

            //float64 (input)
            let a1 = {X: 1, Y: 0, Z: 0};
            let a2 = {X: 0, Y: 1, Z: 0};
            let a3 = {X: 0, Y: 0, Z: 1};

            let black = {X: 0, Y: 0, Z: 0};

            let _red:number = Vector.NewVector(a1);
            let _green:number = Vector.NewVector(a2);
            let _blue:number = Vector.NewVector(a3);
            let result1:number = Vector.NewVector();

            let tmp1:number = Vector.Mul_mem(_red, _green);

            Vector.Mul_mem(tmp1, _blue, result1);

            let result2:number = Vector.Mul_mem(tmp1, _blue);

            expect(black).toEqual(Vector.XYZ(result1));
            expect(black).toEqual(Vector.XYZ(result2));
        });

        it("Should multiply scalar without a problem", () => {

            //float64 (input)
            let white = {X: 1, Y: 1, Z: 1};

            let halfwhite = {X: 0.5, Y: 0.5, Z: 0.5};

            let _white:number = Vector.NewVector(white);
            let result1:number = Vector.NewVector();

            Vector.MulScalar_mem(_white, 0.5, result1);

            let result2:number = Vector.MulScalar_mem(_white, 0.5);
            let result3:number = Vector.MulScalar_mem(_white, 0.5000000000000001);


            expect(halfwhite).toEqual(Vector.XYZ(result1));
            expect(halfwhite).toEqual(Vector.XYZ(result2));
            expect(halfwhite).not.toEqual(Vector.XYZ(result3));
        });

        it("Should divide scalar without a problem", () => {

            //float64 (input)
            let white = {X: 1, Y: 1, Z: 1};

            //uint8 (output)
            let halfwhite = {X: 0.5, Y: 0.5, Z: 0.5};

            let _white:number = Vector.NewVector(white);
            let result1:number = Vector.NewVector();

            Vector.DivScalar_mem(_white, 2, result1);

            let result2:number = Vector.DivScalar_mem(_white, 2);


            expect(halfwhite).toEqual(Vector.XYZ(result1));
            expect(halfwhite).toEqual(Vector.XYZ(result2));
        });

        it("Should calculate minimum value without a problem", () => {

            //float64 (input)
            let vector1 = {X: 1, Y: 0.00055, Z: 0.0255};
            let vector2 = {X: 0.25, Y: 0.5, Z: 0.05};

            let min = {X: 0.25, Y: 0.00055, Z: 0.0255};

            let _c1:number = Vector.NewVector(vector1);
            let _c2:number = Vector.NewVector(vector2);

            let result1:number = Vector.NewVector();

            Vector.Min_mem(_c1, _c2, result1);

            let result2:number = Vector.Min_mem(_c1, _c2);


            expect(min).toEqual(Vector.XYZ(result1));
            expect(min).toEqual(Vector.XYZ(result2));
        });

        it("Should calculate maximum value without a problem", () => {

            //float64 (input)
            let vector1 = {X: 1, Y: 0.00055, Z: 0.0255};
            let vector2 = {X: 0.25, Y: 0.5, Z: 0.05};

            let max = {X: 1, Y: 0.5, Z: 0.05};

            let _c1:number = Vector.NewVector(vector1);
            let _c2:number = Vector.NewVector(vector2);

            let result1:number = Vector.NewVector();

            Vector.Max_mem(_c1, _c2, result1);

            let result2:number = Vector.Max_mem(_c1, _c2);


            expect(max).toEqual(Vector.XYZ(result1));
            expect(max).toEqual(Vector.XYZ(result2));
        });

        it("Should calculate minimum component without a problem", () => {

            //float64 (input)
            let vector1 = {X: 1, Y: 0.00055, Z: 0.0255};

            let _c1:number = Vector.NewVector(vector1);

            let result:number = Vector.MinComponent_mem(_c1);


            expect(result).toEqual(0.00055);
        });

        it("Should calculate maximum component without a problem", () => {

            //float64 (input)
            let vector1 = {X: 1, Y: 0.00055, Z: 0.0255};

            let _c1:number = Vector.NewVector(vector1);

            let result:number = Vector.MaxComponent_mem(_c1);


            expect(result).toEqual(1);
        });

        it("Should calculate power without a problem", () => {

            let factor:number = 2;
            //float64 (input)
            let vector = {X: 1, Y: 0.00055, Z: 0.0255};
            let color_pow = {
                X: Math.pow(vector.X, factor),
                Y: Math.pow(vector.Y, factor),
                Z: Math.pow(vector.Z, factor)
            };

            let _c1:number = Vector.NewVector(vector);

            let result:number = Vector.Pow_mem(_c1, factor);

            expect(Vector.XYZ(result)).toEqual(color_pow);
        });

        it("Should check IsEqual without a problem", () => {

            //float64 (input)
            let vector1 = {X: 0.256, Y: 0, Z: 1};
            let vector2 = {X: 0.256, Y: 0, Z: 1};
            let color3 = {X: 0.254, Y: 1, Z: 0.0255};

            let _c1:number = Vector.NewVector(vector1);
            let _c2:number = Vector.NewVector(vector2);
            let _c3:number = Vector.NewVector(color3);

            let result1:boolean = Vector.IsEqual(_c1, _c2);
            let result2:boolean = Vector.IsEqual(_c2, _c1);
            let result3:boolean = Vector.IsEqual(_c1, _c3);
            let result4:boolean = Vector.IsEqual(_c2, _c3);

            expect(result1).toBeTruthy();
            expect(result2).toBeTruthy();
            expect(result3).not.toBeTruthy();
            expect(result4).not.toBeTruthy();
        });

        it("Should set value without a problem", () => {

            //float64 (input)
            let a3 = {X: 0, Y: 0, Z: 1};

            let _c:number = Vector.NewVector();

            let result:number = Vector.Set(_c, a3.X, a3.Y, a3.Z);

            expect(Vector.XYZ(result)).toEqual(a3);
        });

        it("Should clone without a problem", () => {

            //float64 (input)
            let a3 = {X: 0, Y: 0, Z: 1};

            let _c:number = Vector.NewVector(a3);

            let result:number = Vector.Clone(_c);

            expect(Vector.XYZ(result)).toEqual(a3);
        });

        it("Should create random vector without a problem", () => {

            let vector1:number = Vector.RandomUnitVector();
            let vector2:number = Vector.RandomUnitVector();
            expect(vector1).not.toBeNull();
            expect(vector2).not.toBeNull();
            expect(Vector.XYZ(vector1)).not.toBeNull();
            expect(Vector.XYZ(vector2)).not.toBeNull();
            expect(Vector.XYZ(vector1)).not.toEqual(Vector.XYZ(vector2));
        });
    });

    describe("Matrix definition >> ", () => {

        it("Matrix should have defined", () => {
            expect(Matrix).toBeDefined();
        });

        it("Matrix should have Identity method", () => {
            expect(Matrix.Identity).toBeDefined();
        });

        it("Matrix should have NewMatrix method", () => {
            expect(Matrix.NewMatrix).toBeDefined();
        });

        it("Matrix should have TranslateUnitMatrix method", () => {
            expect(Matrix.TranslateUnitMatrix).toBeDefined();
        });

        it("Matrix should have ScaleUnitMatrix method", () => {
            expect(Matrix.ScaleUnitMatrix).toBeDefined();
        });

        it("Matrix should have RotateUnitMatrix method", () => {
            expect(Matrix.RotateUnitMatrix).toBeDefined();
        });

        it("Matrix should have FrustumUnitMatrix method", () => {
            expect(Matrix.FrustumUnitMatrix).toBeDefined();
        });

        it("Matrix should have OrthographicUnitMatrix method", () => {
            expect(Matrix.OrthographicUnitMatrix).toBeDefined();
        });

        it("Matrix should have PerspectiveUnitMatrix method", () => {
            expect(Matrix.PerspectiveUnitMatrix).toBeDefined();
        });

        it("Matrix should have LookAtMatrix method", () => {
            expect(Matrix.LookAtMatrix).toBeDefined();
        });

        it("Matrix should have Translate method", () => {
            expect(Matrix.Translate).toBeDefined();
        });

        it("Matrix should have Scale method", () => {
            expect(Matrix.Scale).toBeDefined();
        });

        it("Matrix should have Rotate method", () => {
            expect(Matrix.Rotate).toBeDefined();
        });

        it("Matrix should have Frustum method", () => {
            expect(Matrix.Frustum).toBeDefined();
        });

        it("Matrix should have Orthographic method", () => {
            expect(Matrix.Orthographic).toBeDefined();
        });

        it("Matrix should have Perspective method", () => {
            expect(Matrix.Perspective).toBeDefined();
        });

        it("Matrix should have Mul method", () => {
            expect(Matrix.Mul).toBeDefined();
        });

        it("Matrix should have MulPosition method", () => {
            expect(Matrix.MulPosition).toBeDefined();
        });

        it("Matrix should have MulDirection method", () => {
            expect(Matrix.MulDirection).toBeDefined();
        });

        it("Matrix should have Mul method", () => {
            expect(Matrix.Mul).toBeDefined();
        });

        it("Matrix should have MulRay method", () => {
            expect(Matrix.MulRay).toBeDefined();
        });

        it("Matrix should have MulBox method", () => {
            expect(Matrix.MulBox).toBeDefined();
        });

        it("Matrix should have Transpose method", () => {
            expect(Matrix.Transpose).toBeDefined();
        });

        it("Matrix should have Determinant method", () => {
            expect(Matrix.Determinant).toBeDefined();
        });

        it("Matrix should have Inverse method", () => {
            expect(Matrix.Inverse).toBeDefined();
        });

    });

    describe("Matrix instance >> ", () => {

        it("Should create without a problem", () => {
            let matrix = new Matrix(0);
            expect(matrix).toBeTruthy();
        });

        it("Should TranslateUnitMatrix without a problem", () => {

            //float64 (input)
            let a1 = {X: 1, Y: 0, Z: 0};
            let vec:number = Vector.NewVector(a1);
            let expectedMat:number = Matrix.NewMatrix(
                1, 0, 0, 1,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
            
            let transUnitMatrix:number = Matrix.TranslateUnitMatrix(vec);
            
            expect(Matrix.IsEqual(transUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(transUnitMatrix)).not.toBeTruthy();
        });

        it("Should ScaleUnitMatrix without a problem", () => {

            //float64 (input)
            let a1 = {X: 1, Y: 0, Z: 0};
            let vec:number = Vector.NewVector(a1);
            let expectedMat:number = Matrix.NewMatrix(
                1, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 1
            );

            let scaleUnitMatrix:number = Matrix.ScaleUnitMatrix(vec);

            expect(Matrix.IsEqual(scaleUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(scaleUnitMatrix)).not.toBeTruthy();
        });

        it("Should RotateUnitMatrix without a problem", () => {

            //float64 (input)
            let a1 = {X: 1, Y: 0, Z: 0};
            let vec:number = Vector.NewVector(a1);
            let expectedMat:number = Matrix.NewMatrix(
                1, 0, 0, 0,
                0, -0.4480736161291702, 0.8939966636005579, 0,
                0, -0.8939966636005579, -0.4480736161291702, 0,
                0, 0, 0, 1
            );

            let rotateUnitMatrix:number = Matrix.RotateUnitMatrix(vec, 90);

            // console.log(Matrix.DATA(rotateUnitMatrix));

            expect(Matrix.IsEqual(rotateUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(rotateUnitMatrix)).not.toBeTruthy();
        });
    });

});