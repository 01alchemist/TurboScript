export function libraryTurbo(): string {
    return `
#if TURBO_JS
declare class boolean {
    toString(): string;
}

declare class sbyte {
    toString(): string;
}

declare class byte {
    toString(): string;
}

declare class short {
    toString(): string;
}

declare class ushort {
    toString(): string;
}

declare class int32 {
    toString(): string;
}

declare class uint32 {
    toString(): string;
}

declare class int64 {
    toString(): string;
}

declare class uint64 {
    toString(): string;
}

declare class float32 {
    toString(): string;
}

declare class float64 {
    toString(): string;
}

declare class string {
    charAt(index: int32): string;
    charCodeAt(index: int32): ushort;
    get length(): int32;
    indexOf(text: string): int32;
    lastIndexOf(text: string): int32;
    operator == (other: string): boolean;
    operator [] (index: int32): ushort { return this.charCodeAt(index); }
    slice(start: int32, end: int32): string;

    startsWith(text: string): boolean { return this.slice(0, text.length) == text; }
    endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }
}
#endif

#if WASM || C

  declare class boolean {
    toString(): string {
      return this ? "true" : "false";
    }
  }

  declare class sbyte {
    toString(): string {
      return (this).toString();
    }
  }

  declare class byte {
    toString(): string {
      return (this).toString();
    }
  }

  declare class short {
    toString(): string {
      return (this).toString();
    }
  }

  declare class ushort {
    toString(): string {
      return (this).toString();
    }
  }

  declare class int32 {
    toString(): string {
      // Special-case this to keep the rest of the code simple
      if (this == -2147483648) {
        return "-2147483648";
      }

      // Treat this like an unsigned integer prefixed by '-' if it's negative
      return internalIntToString((this < 0 ? -this : this), this < 0);
    }
  }

  declare class uint32 {
    toString(): string {
      return internalIntToString(this, false);
    }
  }

    declare class float32 {
        toString(): string {
            return "C Float to string not implemented";
        }
    }
    declare class float64 {
        toString(): string {
            return "C Float to string not implemented";
        }
    }

    /*function internalFloatToString(value: float32): string {
        // Extract integer part
        var ipart:int32 = value;

        // Extract floating part
        var fpart:float32 = value - (ipart as float32);

        // convert integer part to string
        var intStr:string = internalIntToString((ipart < 0 ? -ipart : ipart), ipart < 0);

        // check for display option after point
        // Get the value of fraction part upto given no.
        // of points after dot. The third parameter is needed
        // to handle cases like 233.007
        fpart = fpart * Math.pow(10, 10);

        return intStr + "." + internalIntToString((fpart), false);
    }*/

  function internalIntToString(value: uint32, sign: boolean): string {
    // Avoid allocation for common cases
    if (value == 0) return "0";
    if (value == 1) return sign ? "-1" : "1";

    unsafe {
      // Determine how many digits we need
      var length = ((sign ? 1 : 0) + (
        value >= 100000000 ?
          value >= 1000000000 ? 10 : 9 :
        value >= 10000 ?
          value >= 1000000 ?
            value >= 10000000 ? 8 : 7 :
            value >= 100000 ? 6 : 5 :
          value >= 100 ?
            value >= 1000 ? 4 : 3 :
            value >= 10 ? 2 : 1));

      var ptr = string_new(length) as *byte;
      var end = ptr + 4 + length * 2;

      if (sign) {
        *((ptr + 4) as *ushort) = '-';
      }

      while (value != 0) {
        end = end + -2;
        *(end as *ushort) = (value % 10 + '0') as ushort;
        value = value / 10;
      }

      return ptr as string;
    }
  }

  function string_new(length: uint32): string {
    unsafe {
      var ptr = malloc(4 + length * 2);
      *(ptr as *uint32) = length;
      return ptr as string;
    }
  }

  declare class string {
    charAt(index: int32): string {
      return this.slice(index, index + 1);
    }

    charCodeAt(index: int32): ushort {
      return this[index];
    }

    get length(): int32 {
      unsafe {
        return *(this as *int32);
      }
    }

    operator [] (index: int32): ushort {
      if (index < this.length) {
        unsafe {
          return *((this as *byte + 4 + index * 2) as *ushort);
        }
      }
      return 0;
    }

    operator == (other: string): boolean {
      unsafe {
        if (this as *byte == other as *byte) return true;
        if (this as *byte == null || other as *byte == null) return false;
        var length = this.length;
        if (length != other.length) return false;
        return memcmp(this as *byte + 4, other as *byte + 4, length * 2) == 0;
      }
    }

    slice(start: int32, end: int32): string {
      var length = this.length;

      if (start < 0) start = start + length;
      if (end < 0) end = end + length;

      if (start < 0) start = 0;
      else if (start > length) start = length;

      if (end < start) end = start;
      else if (end > length) end = length;

      unsafe {
        var range = (end - start);
        var ptr = string_new(range);
        memcpy(ptr as *byte + 4, this as *byte + 4 + start * 2, range * 2);
        return ptr;
      }
    }

    startsWith(text: string): boolean {
      var textLength = text.length;
      if (this.length < textLength) return false;
      unsafe {
        return memcmp(this as *byte + 4, text as *byte + 4, textLength * 2) == 0;
      }
    }

    endsWith(text: string): boolean {
      var thisLength = this.length;
      var textLength = text.length;
      if (thisLength < textLength) return false;
      unsafe {
        return memcmp(this as *byte + 4 + (thisLength - textLength) * 2, text as *byte + 4, textLength * 2) == 0;
      }
    }

    indexOf(text: string): int32 {
      var thisLength = this.length;
      var textLength = text.length;
      if (thisLength >= textLength) {
        var i = 0;
        while (i < thisLength - textLength) {
          unsafe {
            if (memcmp(this as *byte + 4 + i * 2, text as *byte + 4, textLength * 2) == 0) {
              return i;
            }
          }
          i = i + 1;
        }
      }
      return -1;
    }

    lastIndexOf(text: string): int32 {
      var thisLength = this.length;
      var textLength = text.length;
      if (thisLength >= textLength) {
        var i = thisLength - textLength;
        while (i >= 0) {
          unsafe {
            if (memcmp(this as *byte + 4 + i * 2, text as *byte + 4, textLength * 2) == 0) {
              return i;
            }
          }
          i = i - 1;
        }
      }
      return -1;
    }
  }
#endif
`;
}
