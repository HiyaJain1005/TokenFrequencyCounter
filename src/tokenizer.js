const KEYWORDS = new Set([
  'int', 'float', 'char', 'string', 'boolean', 'if', 'else', 'while', 'for', 
  'return', 'class', 'def', 'import', 'void', 'public', 'private', 'static', 'const', 'let', 'var'
]);

const OPERATORS = new Set([
  '+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '<<', '>>'
]);

const DELIMITERS = new Set([
  '{', '}', '(', ')', '[', ']', ';', ',', ':', '.'
]);

export function analyzeTokenStream(sourceCode) {
  let state = 'START';
  let cursor = 0;
  let currentToken = '';
  const tokens = [];
  const errors = [];
  const frequencies = {
    Keyword: 0,
    Identifier: 0,
    Operator: 0,
    Literal: 0,
    Delimiter: 0
  };

  const lineCols = computeLineCols(sourceCode);

  function pushToken(type, value, startPos, endPos) {
    tokens.push({
      id: crypto.randomUUID(),
      type,
      value,
      start: startPos,
      end: endPos,
      loc: getLoc(lineCols, startPos, endPos)
    });
    if (frequencies[type] !== undefined) {
      frequencies[type]++;
    }
  }

  function getLoc(lineCols, start, end) {
    // Simple helper to get line/col roughly
    // Just for display if needed
    return { start, end };
  }

  let startPos = 0;

  while (cursor < sourceCode.length) {
    const char = sourceCode[cursor];
    const nextChar = sourceCode[cursor + 1] || '';

    switch (state) {
      case 'START':
        if (/\s/.test(char)) {
          // skip whitespace
          cursor++;
        } else if (/[a-zA-Z_]/.test(char)) {
          state = 'IDENTIFIER';
          startPos = cursor;
          currentToken += char;
          cursor++;
        } else if (/[0-9]/.test(char)) {
          state = 'NUMBER';
          startPos = cursor;
          currentToken += char;
          cursor++;
        } else if (char === '"' || char === "'") {
          state = 'STRING';
          startPos = cursor;
          currentToken += char;
          cursor++;
        } else if (char === '/' && nextChar === '/') {
          state = 'COMMENT_LINE';
          startPos = cursor;
          currentToken += char + nextChar;
          cursor += 2;
        } else if (char === '#') {
          state = 'COMMENT_LINE';
          startPos = cursor;
          currentToken += char;
          cursor++;
        } else if (char === '/' && nextChar === '*') {
          state = 'COMMENT_BLOCK';
          startPos = cursor;
          currentToken += char + nextChar;
          cursor += 2;
        } else if (OPERATORS.has(char + nextChar)) {
          // Two-char operators
          pushToken('Operator', char + nextChar, cursor, cursor + 2);
          cursor += 2;
        } else if (OPERATORS.has(char)) {
          pushToken('Operator', char, cursor, cursor + 1);
          cursor++;
        } else if (DELIMITERS.has(char)) {
          pushToken('Delimiter', char, cursor, cursor + 1);
          cursor++;
        } else {
          // Unknown token error
          errors.push({
            message: `Unknown symbol '${char}'`,
            position: cursor,
            loc: getLoc(lineCols, cursor, cursor+1)
          });
          cursor++;
        }
        break;

      case 'IDENTIFIER':
        if (/[a-zA-Z0-9_]/.test(char)) {
          currentToken += char;
          cursor++;
        } else {
          // End of identifier
          if (KEYWORDS.has(currentToken)) {
            pushToken('Keyword', currentToken, startPos, cursor);
          } else {
            pushToken('Identifier', currentToken, startPos, cursor);
          }
          currentToken = '';
          state = 'START';
        }
        break;

      case 'NUMBER':
        if (/[0-9.]/.test(char)) {
          currentToken += char;
          cursor++;
        } else {
          // Can check if multiple dots exist, but keeping it simple FSM
          pushToken('Literal', currentToken, startPos, cursor);
          currentToken = '';
          state = 'START';
        }
        break;

      case 'STRING':
        currentToken += char;
        cursor++;
        if (char === currentToken[0] && sourceCode[cursor-2] !== '\\') {
          // End of string
          pushToken('Literal', currentToken, startPos, cursor);
          currentToken = '';
          state = 'START';
        } else if (char === '\n') {
          errors.push({
            message: `Unterminated string literal`,
            position: startPos,
            loc: getLoc(lineCols, startPos, cursor)
          });
          currentToken = '';
          state = 'START';
        }
        break;

      case 'COMMENT_LINE':
        currentToken += char;
        cursor++;
        if (char === '\n') {
          // We can optionally store comments as tokens, but usually they are ignored.
          // For visualization, maybe we do? Let's just reset.
          currentToken = '';
          state = 'START';
        }
        break;

      case 'COMMENT_BLOCK':
        currentToken += char;
        cursor++;
        if (char === '*' && nextChar === '/') {
          currentToken += nextChar;
          cursor++;
          currentToken = '';
          state = 'START';
        }
        break;
    }
  }

  // Handle EOF in states
  if (state === 'IDENTIFIER') {
    if (KEYWORDS.has(currentToken)) pushToken('Keyword', currentToken, startPos, cursor);
    else pushToken('Identifier', currentToken, startPos, cursor);
  } else if (state === 'NUMBER') {
    pushToken('Literal', currentToken, startPos, cursor);
  } else if (state === 'STRING') {
    errors.push({
      message: `Unterminated string literal at EOF`,
      position: startPos,
      loc: getLoc(lineCols, startPos, cursor)
    });
  }

  return { tokens, frequencies, errors };
}

function computeLineCols(source) {
  const lines = source.split('\n');
  return lines; // Placeholder for real line/col mapping
}
