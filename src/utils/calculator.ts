/**
 * Evaluates an arithmetic expression string with +, -, *, / (or ×, ÷)
 * safely without eval. Follows standard operator precedence (* and / before + and -).
 * Supports decimals and parentheses if needed, but primarily handles chained
 * operations like "100 + 50 * 2" or "500 - 10%".
 */

export interface MathEvaluationResult {
  value: number;
  isValid: boolean;
  error?: string;
  expression: string;
}

// Token types
type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Tokenize arithmetic expression
 */
function tokenize(expr: string): Token[] {
  // Normalize symbols: × -> *, ÷ -> /, minus signs
  const normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  const tokens: Token[] = [];
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];

    // Numbers (including decimals)
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      let hasDot = false;
      while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
        if (normalized[i] === '.') {
          if (hasDot) break;
          hasDot = true;
        }
        numStr += normalized[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Unary minus or binary operator
    if (char === '+' || char === '-' || char === '*' || char === '/') {
      // Check for unary minus at beginning or after operator
      if (char === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'OPERATOR' || tokens[tokens.length - 1].type === 'LPAREN')) {
        // Collect negative number
        i++;
        let numStr = '-';
        let hasDot = false;
        while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
          if (normalized[i] === '.') {
            if (hasDot) break;
            hasDot = true;
          }
          numStr += normalized[i];
          i++;
        }
        if (numStr === '-') {
          // If followed by nothing, treat as operator
          tokens.push({ type: 'OPERATOR', value: '-' });
        } else {
          tokens.push({ type: 'NUMBER', value: numStr });
        }
        continue;
      }

      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Skip unknown characters
    i++;
  }

  return tokens;
}

/**
 * Shunting-Yard Algorithm to convert Infix to Reverse Polish Notation (RPN)
 */
function shuntingYard(tokens: Token[]): Token[] {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'OPERATOR') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === 'OPERATOR' &&
        precedence[operatorStack[operatorStack.length - 1].value] >= precedence[token.value]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'LPAREN') {
        operatorStack.pop();
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type !== 'LPAREN') {
      outputQueue.push(top);
    }
  }

  return outputQueue;
}

/**
 * Evaluates RPN tokens
 */
function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'OPERATOR') {
      if (stack.length < 2) return NaN;
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(b === 0 ? 0 : a / b);
          break;
        default:
          return NaN;
      }
    }
  }

  return stack.length === 1 ? stack[0] : NaN;
}

/**
 * Safely evaluates an arithmetic expression.
 * Returns evaluated number, or fallback if invalid/incomplete.
 */
export function evaluateExpression(expr: string): MathEvaluationResult {
  if (!expr || expr.trim() === '') {
    return { value: 0, isValid: true, expression: '' };
  }

  const clean = expr.trim();

  // If simple numeric string without operators
  if (/^-?\d*(\.\d*)?$/.test(clean.replace(/\s+/g, ''))) {
    const val = parseFloat(clean);
    return {
      value: isNaN(val) ? 0 : val,
      isValid: true,
      expression: clean,
    };
  }

  // Check if expression ends with an operator (incomplete expression while typing)
  // e.g. "100 + 50 +" -> strip trailing operator for preview calculation
  let evaluable = clean;
  while (/[+\-*/×÷]$/.test(evaluable.trim())) {
    evaluable = evaluable.trim().slice(0, -1).trim();
  }

  if (!evaluable) {
    return { value: 0, isValid: false, expression: clean, error: 'Incomplete' };
  }

  try {
    const tokens = tokenize(evaluable);
    if (tokens.length === 0) {
      return { value: 0, isValid: true, expression: clean };
    }

    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn);

    if (isNaN(result) || !isFinite(result)) {
      return { value: 0, isValid: false, expression: clean, error: 'Invalid Math' };
    }

    return {
      value: Math.round(result * 10000) / 10000,
      isValid: true,
      expression: clean,
    };
  } catch (err) {
    return {
      value: 0,
      isValid: false,
      expression: clean,
      error: 'Calculation error',
    };
  }
}

/**
 * Checks if a string contains any arithmetic operator
 */
export function hasArithmeticOperators(expr: string): boolean {
  return /[+\-*/×÷]/.test(expr);
}
