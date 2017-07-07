Editing... :construction:

This part of the TurboScript section serves as a repository of facts about the TurboScript language. Read more [about this reference](About-this-reference). Most of this reference is redundant to JavaScript language reference. You may check [difference between JavaScript and TurboScript](Difference-between-JavaScript-and-TurboScript) for non-standard language features added in to TurboScript.
# Global Objects
This chapter documents all the TurboScript standard built-in objects, along with their methods and properties.

| Icon |   Meaning   |
| ---- | ----------- |
| 🍼   | Need improvement |
| 🚧   | Implementing |
| 🕥   | Planned |
| 💥   | Not all targets support |
| ❗️   | Bug in Implementation |
| 👎   | Not usable |
| ❌   | Removed |
| ⚠️   | Deprecated |

## Value properties
These global properties return a simple value; they have no properties or methods.

* [Infinity](Infinity) 🕥 
* [NaN](NaN) 🕥
* [undefined](undefined) 🕥
* [null](null) literal

## Function properties
These global functions—functions which are called globally rather than on an object—directly return their results to the caller.

* [isFinite()](isFinite) 🕥
* [malloc()](malloc)
* [free()](free)

## Fundamental objects
These are the fundamental, basic objects upon which all other objects are based. This includes objects that represent general objects, functions, and errors.

* [Object](Object) 🕥
* [Function](Function)
* [boolean](boolean)
* [Error](Error) 🕥
* [InternalError](InternalError) 🕥
* [RangeError](RangeError) 🕥
* [ReferenceError](ReferenceError) 🕥
* [SyntaxError](SyntaxError) 🕥
* [TypeError](TypeError) 🕥

## Numbers and dates
These are the base objects representing numbers, dates, and mathematical calculations.

* [int/uint](integer)
* [float](float)
* [Math](Math) 🚧 
* [Date](Date) 🕥

## Text processing
These objects represent strings and support manipulating them.

* [string](string)

## Indexed collections
These objects represent collections of data which are ordered by an index value. This includes (typed) arrays and array-like constructs.

* [Array](Array) 🚧 
* [Int8Array](Int8Array) 🚧 
* [Uint8Array](Uint8Array) 🚧 
* [Uint8ClampedArray](Uint8ClampedArray) 🚧 
* [Int16Array](Int16Array) 🚧 
* [Uint16Array](Uint16Array) 🚧 
* [Int32Array](Int32Array) 🚧 
* [Uint32Array](Uint32Array) 🚧 
* [Float32Array](Float32Array) 🚧 
* [Float64Array](Float64Array) 🚧 

## Keyed collections
These objects represent collections which use keys; these contain elements which are iterable in the order of insertion.

* [Map](Map) 🕥
* [Set](Set) 🕥
* [WeakMap](WeakMap) 🕥
* [WeakSet](WeakSet) 🕥

## Vector collections
SIMD vector data types are objects where data is arranged into lanes.

* [SIMD](SIMD) 🕥
* [SIMD.Float32x4](SIMD.Float32x4) 🕥
* [SIMD.Float64x2](SIMD.Float64x2) 🕥
* [SIMD.Int8x16](SIMD.Int8x16) 🕥
* [SIMD.Int16x8](SIMD.Int16x8) 🕥
* [SIMD.Int32x4](SIMD.Int32x4) 🕥
* [SIMD.Uint8x16](SIMD.Uint8x16) 🕥
* [SIMD.Uint16x8](SIMD.Uint16x8) 🕥
* [SIMD.Uint32x4](SIMD.Uint32x4) 🕥
* [SIMD.Bool8x16](SIMD.Bool8x16) 🕥
* [SIMD.Bool16x8](SIMD.Bool16x8) 🕥
* [SIMD.Bool32x4](SIMD.Bool32x4) 🕥
* [SIMD.Bool64x2](SIMD.Bool64x2) 🕥

## Structured data
These objects represent and interact with structured data buffers and data coded using JavaScript Object Notation (JSON).

* [ArrayBuffer](ArrayBuffer) 💥 🕥
* [SharedArrayBuffer](SharedArrayBuffer) 💥 🕥
* [Atomics](Atomics) 💥 🕥
* [DataView](DataView) 💥 🕥
* [JSON](JSON) 💥 🕥

## Statements
This chapter documents all the [TurboScript statements and declarations](Statements-and-declarations).

### Control flow
#### [Block](Statement-Block)
A block statement is used to group zero or more statements. The block is delimited by a pair of curly brackets.

#### [break](Statement-break)
Terminates the current loop, switch, or label statement and transfers program control to the statement following the terminated statement.

### [continue](Statement-continue)
Terminates execution of the statements in the current iteration of the current or labeled loop, and continues execution of the loop with the next iteration.

### [Empty](Statement-Empty)
An empty statement is used to provide no statement, although the TurboScript syntax would expect one.

### [if...else](Statement-if...else)
Executes a statement if a specified condition is true. If the condition is false, another statement can be executed.

### [switch](Statement-switch)
Evaluates an expression, matching the expression's value to a case clause, and executes statements associated with that case.

### [throw](Statement-throw) 💥 🕥
Throws a user-defined exception.

### [try...catch](Statement-try...catch) 💥 🕥
Marks a block of statements to try, and specifies a response, should an exception be thrown.

## Declarations

### [var](Declarations-var) 
Declares a variable, optionally initializing it to a value.
### [let](Declarations-let)
Declares a block scope local variable, optionally initializing it to a value.
### [const](Declarations-const)
Declares a read-only named constant.

## Functions and classes

### [function](function)
Declares a function with the specified parameters.
### [return](return)
Specifies the value to be returned by a function.
### [class](class)
Declares a class.

## Iterations
### [for](Iterations-for)
Creates a loop that consists of three optional expressions, enclosed in parentheses and separated by semicolons, followed by a statement executed in the loop.
### [while](Iterations-while)
Creates a loop that executes a specified statement as long as the test condition evaluates to true. The condition is evaluated before executing the statement.

## Others
### [debugger](debugger)
Invokes any available debugging functionality. If no debugging functionality is available, this statement has no effect.
### [export](export)
Used to export functions to make them available for imports in external modules, another scripts.
### [import](import)
Used to import functions exported from an external module, another script.
### [label](label)
Provides a statement with an identifier that you can refer to using a break or continue statement.

## Expressions and operators
This chapter documents all the [TurboScript expressions and operators](Expressions-and-Operators).

### Primary expressions
Basic keywords and general expressions in TurboScript.
### [this](Expression-this)
The this keyword refers to the function's execution context.
### [function](Expression-function)
The function keyword defines a function expression.
### [class](Expression-class)
The class keyword defines a class expression.
### [( )](Expression-group)
Grouping operator.

## Left-hand-side expressions
Left values are the destination of an assignment.

### [Property accessors](Property-accessors)
Member operators provide access to a property or method of an object
(object.property).

### [new](Expression-new)
The new operator creates an instance of a constructor.

### [super](Expression-super)
The super keyword calls the parent constructor.

## Increment and decrement
Postfix/prefix increment and postfix/prefix decrement operators.

### [A++](Arithmetic-operators#Increment)
Postfix increment operator.
### [A--](Arithmetic-operators#Decrement)
Postfix decrement operator.
### [++A](Arithmetic-operators#Increment)
Prefix increment operator.
### [--A](Arithmetic-operators#Decrement)
Prefix decrement operator.

## Unary operators
A unary operation is operation with only one operand.

### [delete](Unary-operator-delete)
The delete operator deletes a property from an object.
### [void](Unary-operator-void)
The void operator discards an expression's return value.
### [typeof](Unary-operator-typeof)
The typeof operator determines the type of a given object.
### [+](Arithmetic-operators#Unary_plus)
The unary plus operator converts its operand to Number type.
### [-](Arithmetic-operators#Unary_negation)
The unary negation operator converts its operand to Number type and then negates it.
### [~](Bitwise-operators#Bitwise_NOT)
Bitwise NOT operator.
### [!](Logical-operators#Logical_NOT)
Logical NOT operator.

## Arithmetic operators
Arithmetic operators take numerical values (either literals or variables) as their operands and return a single numerical value.

### [+](Arithmetic-operators#Addition)
Addition operator.
### [-](Arithmetic-operators#Substraction)
Subtraction operator.
### [/](Arithmetic-operators#Division)
Division operator.
### [*](Arithmetic-operators#Multiplication)
Multiplication operator.
### [%](Arithmetic-operators#Remainder)
Remainder operator.

## Relational operators
A comparison operator compares its operands and returns a boolean value based on whether the comparison is true.

### [instanceof](instanceof)
The instanceof operator determines whether an object is an instance of another object.
### [<](Comparison-operator#Less_than)
Less than operator.
### [>](Comparison-operator#Greater_than)
Greater than operator.
### [<=](Comparison-operator#Less_than_or_equal)
Less than or equal operator.
### [>=](Comparison-operator#Greater_than_or_equal)
Greater than or equal operator.

## Equality operators
The result of evaluating an equality operator is always of type Boolean based on whether the comparison is true.

### [==](Comparison-operator#Equality)
Equality operator.
### [!=](Comparison-operator#Inequality)
Inequality operator.
### [===](Comparison-operator#Identity)
Identity operator.
### [!==](Comparison-operator#Nonidentity)
Nonidentity operator.

## Bitwise shift operators
Operations to shift all bits of the operand.

### [<<](Bitwise-operators#Left_shift)
Bitwise left shift operator.
### [>>](Bitwise-operators#Right_shift)
Bitwise right shift operator.
### [>>>](Bitwise-operators#Unsigned_right_shift)
Bitwise unsigned right shift operator.

## Binary bitwise operators
Bitwise operators treat their operands as a set of 32 bits (zeros and ones) and return standard JavaScript numerical values.

### [&](Bitwise-operators#Bitwise_AND)
Bitwise AND.
### [|](Bitwise-operators#Bitwise_OR)
Bitwise OR.
### [^](Bitwise-operators#Bitwise_XOR)
Bitwise XOR.

## Binary logical operators
Logical operators are typically used with boolean (logical) values, and when they are, they return a boolean value.

### [&&](Logical-operators#Logical_AND)
Logical AND.
### [||](Logical-operators#Logical_OR)
Logical OR.

## Conditional (ternary) operator
### [(condition ? ifTrue : ifFalse)](Conditional-operator)
The conditional operator returns one of two values based on the logical value of the condition.

## Assignment operators
An assignment operator assigns a value to its left operand based on the value of its right operand.

### [=](Assignment-operators#Assignment)
Assignment operator.
### [*=](Assignment-operators#Multiplication_assignment)
Multiplication assignment.
### [/=](Assignment-operators#Division_assignment)
Division assignment.
### [%=](Assignment-operators#Remainder_assignment)
Remainder assignment.
### [+=](Assignment-operators#Addition_assignment)
Addition assignment.
### [-=](Assignment-operators#Substraction_assignment)
Subtraction assignment
### [<<=](Assignment-operators#Left_shift_assignment)
Left shift assignment.
### [>>=](Assignment-operators#Right_shift_assignment)
Right shift assignment.
### [>>>=](Assignment-operators#Unsigned_right_shift_assignment)
Unsigned right shift assignment.
### [&=](Assignment-operators#Bitwise_AND_assignment)
Bitwise AND assignment.
### [^=](Assignment-operators#Bitwise_XOR_assignment)
Bitwise XOR assignment.
### [|=](Assignment-operators#Bitwise_OR_assignment)
Bitwise OR assignment.
