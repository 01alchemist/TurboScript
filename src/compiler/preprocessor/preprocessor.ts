import {Log, spanRanges, Source, DiagnosticKind} from "../../utils/log";
import {StringBuilder_new} from "../../utils/stringbuilder";
import {TokenKind, Token, tokenToString} from "../scanner/scanner";
import {Precedence} from "../parser/parser";
export enum PreprocessorValue {
  FALSE,
  TRUE,
  ERROR,
}

export class PreprocessorFlag {
  isDefined: boolean;
  name: string;
  next: PreprocessorFlag;
}

// This preprocessor implements the flag-only conditional behavior from C#.
// There are two scopes for flags: global-level and file-level. This is stored
// using an ever-growing linked list of PreprocessorFlag objects that turn a
// flag either on or off. That way file-level state can just reference the
// memory of the global-level state and the global-level state can easily be
// restored after parsing a file just by restoring the pointer.
export class Preprocessor {
  firstFlag: PreprocessorFlag;
  isDefineAndUndefAllowed: boolean;
  previous: Token;
  current: Token;
  log: Log;

  peek(kind: TokenKind): boolean {
    return this.current.kind == kind;
  }

  eat(kind: TokenKind): boolean {
    if (this.peek(kind)) {
      this.advance();
      return true;
    }

    return false;
  }

  advance(): void {
    if (!this.peek(TokenKind.END_OF_FILE)) {
      this.previous = this.current;
      this.current = this.current.next;
    }
  }

  unexpectedToken(): void {
    this.log.error(this.current.range, StringBuilder_new()
      .append("Unexpected ")
      .append(tokenToString(this.current.kind))
      .finish());
  }

  expect(kind: TokenKind): boolean {
    if (!this.peek(kind)) {
      this.log.error(this.current.range, StringBuilder_new()
        .append("Expected ")
        .append(tokenToString(kind))
        .append(" but found ")
        .append(tokenToString(this.current.kind))
        .finish());
      return false;
    }

    this.advance();
    return true;
  }

  removeTokensFrom(before: Token): void {
    before.next = this.current;
    this.previous = before;
  }

  isDefined(name: string): boolean {
    var flag = this.firstFlag;
    while (flag != null) {
      if (flag.name == name) {
        return flag.isDefined;
      }
      flag = flag.next;
    }
    return false;
  }

  define(name: string, isDefined: boolean): void {
    var flag = new PreprocessorFlag();
    flag.isDefined = isDefined;
    flag.name = name;
    flag.next = this.firstFlag;
    this.firstFlag = flag;
  }

  run(source: Source, log: Log): void {
    var firstToken = source.firstToken;

    if (firstToken != null && firstToken.kind == TokenKind.PREPROCESSOR_NEEDED) {
      var firstFlag = this.firstFlag;

      // Initialize
      this.isDefineAndUndefAllowed = true;
      this.previous = firstToken;
      this.current = firstToken.next;
      this.log = log;

      // Don't parse this file if preprocessing failed
      if (!this.scan(true)) {
        source.firstToken = null;
        return;
      }

      // Make sure blocks are balanced
      if (!this.peek(TokenKind.END_OF_FILE)) {
        this.unexpectedToken();
      }

      // Restore the global-level state instead of letting the file-level state
      // leak over into the next file that the preprocessor is run on
      this.firstFlag = firstFlag;

      // Skip over the PREPROCESSOR_NEEDED token so the parser doesn't see it
      source.firstToken = source.firstToken.next;
    }
  }

  // Scan over the next reachable tokens, evaluate #define/#undef directives,
  // and fold #if/#else chains. Stop on #elif/#else/#endif. Return false on
  // failure. Takes a booleanean flag for whether or not control flow is live in
  // this block.
  scan(isParentLive: boolean): boolean {
    while (!this.peek(TokenKind.END_OF_FILE) &&
        !this.peek(TokenKind.PREPROCESSOR_ELIF) &&
        !this.peek(TokenKind.PREPROCESSOR_ELSE) &&
        !this.peek(TokenKind.PREPROCESSOR_ENDIF)) {
      var previous = this.previous;
      var current = this.current;

      // #define or #undef
      if (this.eat(TokenKind.PREPROCESSOR_DEFINE) || this.eat(TokenKind.PREPROCESSOR_UNDEF)) {
        // Only process the directive if control flow is live at this point
        if (this.expect(TokenKind.IDENTIFIER) && isParentLive) {
          this.define(this.previous.range.toString(), current.kind == TokenKind.PREPROCESSOR_DEFINE);
        }

        // Help out people trying to use this like C
        if (this.eat(TokenKind.FALSE) || this.eat(TokenKind.INT32) && this.previous.range.toString() == "0") {
          this.log.error(this.previous.range, "Use '#undef' to turn a preprocessor flag off");
        }

        // Scan up to the next newline
        if (!this.peek(TokenKind.END_OF_FILE) && !this.expect(TokenKind.PREPROCESSOR_NEWLINE)) {
          while (!this.eat(TokenKind.PREPROCESSOR_NEWLINE) && !this.eat(TokenKind.END_OF_FILE)) {
            this.advance();
          }
        }

        // These statements are only valid at the top of the file
        if (!this.isDefineAndUndefAllowed) {
          this.log.error(spanRanges(current.range, this.previous.range),
            "All '#define' and '#undef' directives must be at the top of the file");
        }

        // Remove all of these tokens
        this.removeTokensFrom(previous);
      }

      // #warning or #error
      else if (this.eat(TokenKind.PREPROCESSOR_WARNING) || this.eat(TokenKind.PREPROCESSOR_ERROR)) {
        var next = this.current;

        // Scan up to the next newline
        while (!this.peek(TokenKind.PREPROCESSOR_NEWLINE) && !this.peek(TokenKind.END_OF_FILE)) {
          this.advance();
        }

        // Only process the directive if control flow is live at this point
        if (isParentLive) {
          var range = this.current == next ? current.range : spanRanges(next.range, this.previous.range);
          this.log.append(range, range.toString(), current.kind == TokenKind.PREPROCESSOR_WARNING ? DiagnosticKind.WARNING : DiagnosticKind.ERROR);
        }

        // Remove all of these tokens
        this.eat(TokenKind.PREPROCESSOR_NEWLINE);
        this.removeTokensFrom(previous);
      }

      // #if
      else if (this.eat(TokenKind.PREPROCESSOR_IF)) {
        var isLive = isParentLive;

        // Scan over the entire if-else chain
        while (true) {
          var condition = this.parseExpression(Precedence.LOWEST);

          // Reject if the condition is missing
          if (condition == PreprocessorValue.ERROR || !this.expect(TokenKind.PREPROCESSOR_NEWLINE)) {
            return false;
          }

          // Remove the #if/#elif header
          this.removeTokensFrom(previous);

          // Scan to the next #elif, #else, or #endif
          if (!this.scan(isLive && condition == PreprocessorValue.TRUE)) {
            return false;
          }

          // Remove these tokens?
          if (!isLive || condition == PreprocessorValue.FALSE) {
            this.removeTokensFrom(previous);
          }

          // Keep these tokens but remove all subsequent branches
          else {
            isLive = false;
          }

          // Update the previous pointer so we remove from here next
          previous = this.previous;

          // #elif
          if (this.eat(TokenKind.PREPROCESSOR_ELIF)) {
            continue;
          }

          // #else
          if (this.eat(TokenKind.PREPROCESSOR_ELSE)) {
            if (!this.expect(TokenKind.PREPROCESSOR_NEWLINE)) {
              return false;
            }

            // Remove the #else
            this.removeTokensFrom(previous);

            // Scan to the #endif
            if (!this.scan(isLive)) {
              return false;
            }

            // Remove these tokens?
            if (!isLive) {
              this.removeTokensFrom(previous);
            }
          }

          // #endif
          break;
        }

        // All if-else chains end with an #endif
        previous = this.previous;
        if (!this.expect(TokenKind.PREPROCESSOR_ENDIF) || !this.peek(TokenKind.END_OF_FILE) && !this.expect(TokenKind.PREPROCESSOR_NEWLINE)) {
          return false;
        }
        this.removeTokensFrom(previous);
      }

      // Skip normal tokens
      else {
        this.isDefineAndUndefAllowed = false;
        this.advance();
      }
    }

    return true;
  }

  parsePrefix(): PreprocessorValue {
    var isDefinedOperator = false;
    var start = this.current;

    // true or false
    if (this.eat(TokenKind.TRUE)) return PreprocessorValue.TRUE;
    if (this.eat(TokenKind.FALSE)) return PreprocessorValue.FALSE;

    // Identifier
    if (this.eat(TokenKind.IDENTIFIER)) {
      var name = this.previous.range.toString();

      // Recover from a C-style define operator
      if (this.peek(TokenKind.LEFT_PARENTHESIS) && name == "defined") {
        isDefinedOperator = true;
      }

      else {
        var isTrue = this.isDefined(name);
        return isTrue ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
      }
    }

    // !
    if (this.eat(TokenKind.NOT)) {
      var value = this.parseExpression(Precedence.UNARY_PREFIX);
      if (value == PreprocessorValue.ERROR) return PreprocessorValue.ERROR;
      return value == PreprocessorValue.TRUE ? PreprocessorValue.FALSE : PreprocessorValue.TRUE;
    }

    // Group
    if (this.eat(TokenKind.LEFT_PARENTHESIS)) {
      var first = this.current;
      var value = this.parseExpression(Precedence.LOWEST);
      if (value == PreprocessorValue.ERROR || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
        return PreprocessorValue.ERROR;
      }

      // Recover from a C-style define operator
      if (isDefinedOperator) {
        var builder = StringBuilder_new().append("There is no 'defined' operator");
        if (first.kind == TokenKind.IDENTIFIER && this.previous == first.next) {
          builder.append(" (just use '").append(first.range.toString()).append("' instead)");
        }
        this.log.error(spanRanges(start.range, this.previous.range), builder.finish());
      }

      return value;
    }

    // Recover from a C-style booleanean
    if (this.eat(TokenKind.INT32)) {
      var isTrue = this.previous.range.toString() != "0";
      this.log.error(this.previous.range, StringBuilder_new()
        .append("Unexpected integer (did you mean '")
        .append(isTrue ? "true" : "false")
        .append("')?")
        .finish());
      return isTrue ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
    }

    this.unexpectedToken();
    return PreprocessorValue.ERROR;
  }

  parseInfix(precedence: Precedence, left: PreprocessorValue): PreprocessorValue {
    var operator = this.current.kind;

    // == or !=
    if (precedence < Precedence.EQUAL && (this.eat(TokenKind.EQUAL) || this.eat(TokenKind.NOT_EQUAL))) {
      var right = this.parseExpression(Precedence.EQUAL);
      if (right == PreprocessorValue.ERROR) return PreprocessorValue.ERROR;
      return (operator == TokenKind.EQUAL) == (left == right) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
    }

    // &&
    if (precedence < Precedence.LOGICAL_AND && this.eat(TokenKind.LOGICAL_AND)) {
      var right = this.parseExpression(Precedence.LOGICAL_AND);
      if (right == PreprocessorValue.ERROR) return PreprocessorValue.ERROR;
      return (left == PreprocessorValue.TRUE && right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
    }

    // ||
    if (precedence < Precedence.LOGICAL_OR && this.eat(TokenKind.LOGICAL_OR)) {
      var right = this.parseExpression(Precedence.LOGICAL_OR);
      if (right == PreprocessorValue.ERROR) return PreprocessorValue.ERROR;
      return (left == PreprocessorValue.TRUE || right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
    }

    // Hook
    if (precedence == Precedence.LOWEST && this.eat(TokenKind.QUESTION_MARK)) {
      var middle = this.parseExpression(Precedence.LOWEST);
      if (middle == PreprocessorValue.ERROR || !this.expect(TokenKind.COLON)) {
        return PreprocessorValue.ERROR;
      }

      var right = this.parseExpression(Precedence.LOWEST);
      if (right == PreprocessorValue.ERROR) {
        return PreprocessorValue.ERROR;
      }

      return left == PreprocessorValue.TRUE ? middle : right;
    }

    return left;
  }

  parseExpression(precedence: Precedence): PreprocessorValue {
    // Prefix
    var value = this.parsePrefix();
    if (value == PreprocessorValue.ERROR) {
      return PreprocessorValue.ERROR;
    }

    // Infix
    while (true) {
      var current = this.current;
      value = this.parseInfix(precedence, value);
      if (value == PreprocessorValue.ERROR) return PreprocessorValue.ERROR;
      if (this.current == current) break;
    }

    return value;
  }
}
