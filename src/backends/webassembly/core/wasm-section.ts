/**
 * Created by n.vinayakan on 02.06.17.
 */
export enum WasmSection {
    Custom = 0, // Custom section
    Signature = 1, // Function signature declarations
    Import = 2, // Import declarations
    Function = 3, // Function declarations
    Table = 4, // Indirect function table and other tables
    Memory = 5, // Memory attributes
    Global = 6, // Global declarations
    Export = 7, // Exports
    Start = 8, // Start function declaration
    Element = 9, // Elements section
    Code = 10, // Function bodies (code)
    Data = 11, // data segments
}
