export function ByteArray_set16(array: ByteArray, index: number, value: number): void {
    array.set(index, value);
    array.set(index + 1, (value >> 8));
}

export function ByteArray_set32(array: ByteArray, index: number, value: number): void {
    array.set(index, value);
    array.set(index + 1, (value >> 8));
    array.set(index + 2, (value >> 16));
    array.set(index + 3, (value >> 24));
}

export function ByteArray_append32(array: ByteArray, value: number): void {
    array.append(value);
    array.append((value >> 8));
    array.append((value >> 16));
    array.append((value >> 24));
}

export function ByteArray_append64(array: ByteArray, value: int64): void {
    array.append(value);
    array.append((value >> 8));
    array.append((value >> 16));
    array.append((value >> 24));
    array.append((value >> 32));
    array.append((value >> 40));
    array.append((value >> 48));
    array.append((value >> 56));
}

declare function Uint8Array_new(length: number): Uint8Array;

export function ByteArray_setString(array: ByteArray, index: number, text: string): void {
    var length = text.length;
    assert(index >= 0 && index + length * 2 <= array.length());
    var data = array._data;
    var i = 0;
    while (i < length) {
        var c = text.charCodeAt(i);
        data[index] = c;
        data[index + 1] = (c >> 8);
        index = index + 2;
        i = i + 1;
    }
}

export class ByteArray {
    _data: Uint8Array;
    _length: number;

    constructor(){
        this._length = 0;
        this._data = new Uint8Array(0);
    }

    length(): number {
        return this._length;
    }

    clear(): void {
        this._length = 0;
    }

    get(index: number): byte {
        assert((index) < (this._length));
        return this._data[index];
    }

    set(index: number, value: byte): void {
        assert((index) < (this._length));
        this._data[index] = value;
    }

    append(value: byte): void {
        var index = this._length;
        this.resize(index + 1);
        this._data[index] = value;
    }

    resize(length: number): void {
        if (length > (this._data != null ? this._data.length : 0)) {
            var capacity = length * 2;
            var data = Uint8Array_new(capacity);
            if (this._data != null) data.set(this._data);
            this._data = data;
        }

        this._length = length;
    }
}