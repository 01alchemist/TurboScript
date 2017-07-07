# Quick start

## [Try online](https://maxgraey.github.io/Assembleash/#TurboScript)

## Install
`npm install -g turboscript`

## Types
Type      | Native type | Description
----------|-------------|-------------
`int8`   | i32         | An 8-bit signed integer.
`uint8`    | i32         | An 8-bit unsigned integer.
`int16`   | i32         | A 16-bit signed integer.
`uint16`  | i32         | A 16-bit unsigned integer.
`int32`     | i32         | A 32-bit signed integer.
`uint32`    | i32         | A 32-bit unsigned integer.
`int64`    | i64         | A 64-bit signed integer.
`uint64`   | i64         | A 64-bit unsigned integer.
`boolean`    | i32         | A 1-bit unsigned integer.
`float32`   | f32         | A 32-bit floating point number.
`float64`  | f64         | A 64-bit floating point number.
`void`    | none        | No return type.
`string`    | *        | A utf-8 encoded textual data type.
`Array<T>`    | *        | A generic array data type.

## Syntax

### variables
```typescript
var myGlobal:int32 = 1;
let evaluatedVar:int32 = myGlobal + 1;
// let is same as var.
```

### Number Literals
```typescript
let integer:int32 = 1234;
let integer64bit:int64 = 1234;
let floatingPoint:float32 = 1.234f;
let floatingPoint64bit:float64 = 1.234; // default floating point number is 64 bit

// You can also omit type since compiler infer type from the literal
let integer = 1234; // default integer is 32 bit, use type :int64 for 64 bit integer 
let floatingPoint = 1.234f;
let floatingPoint64bit = 1.234;
```

### function
```typescript
// add.tbs
export function add(a:int32, b:int32):int32 {
    return a + b;
}
```

### class
```typescript
// vector3D.tbs
export class Vector3D {
    x:float32;
    y:float32;
    z:float32;

    constructor(x:float32, y:float32, z:float32){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
```

### Generic
```typescript
class Foo<T> {
    value:T;
    constructor(value:T){
        this.value = value;
    }
    getValue():T {
        return this.value;
    }
}

export function testI32(value:int32):int32 {
    let instance = new Foo<int32>(value);
    return instance.getValue();
}

export function testI64(value:int32):int32 {
    let value2 = value as int64;
    let instance = new Foo<int64>(value2);
    return instance.getValue() as int32;
}

export function testF32(value:float32):float32 {
    let instance = new Foo<float32>(value);
    return instance.getValue();
}

export function testF64(value:float64):float64 {
    let instance = new Foo<float64>(value);
    return instance.getValue();
}
```

### Operator overload
```typescript
class Vector3D {
    x:float32;
    y:float32;
    z:float32;

    constructor(x:float32, y:float32, z:float32){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    operator + (other:Vector3D):Vector3D {
        return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    operator - (other:Vector3D):Vector3D {
        return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }
}
export function test():boolean {
    let a = new Vector3D(1.0f,1.0f,1.0f);
    let b = new Vector3D(1.0f,1.0f,1.0f);
    let c = a + b;
    return c.x == 2.0f && c.y == 2.0f && c.z == 2.0f;
}
```

### Array
```typescript
// f64-array.tbs
var a: Array<float64> = null;

export function test(num:int32): Array<float64> {
    a = new Array<float64>(num);
    let i:int32 = 0;
    while (i < num) {
        a[i] = 0.0;
        i = i + 1;
    }
    return a;
}

export function getArrayByteLength(value:Array<float64>):int32 {
    return value.bytesLength;
}
export function getArrayElementSize(value:Array<float64>):int32 {
    return value.elementSize;
}

export function getArray(): Array<float64> {
    return a;
}
export function getData(index:int32):float64 {
    return a[index];
}
export function setData(index:int32, value:float64):void {
    a[index] = value;
}

```

#### Compile to wasm
`tc add.tbs --out add.wasm`
