// 深拷贝函数，保持不变
export function deepCopy(target) {
  if (typeof target === 'object') {
    const result = Array.isArray(target) ? [] : {};
    for (const key in target) {
      if (typeof target[key] === 'object') {
        result[key] = deepCopy(target[key]);
      } else {
        result[key] = target[key];
      }
    }
    return result;
  }
  return target;
}

// 交换数组元素的函数，去掉 Vue.set，改为直接赋值
export function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j]; // 直接使用数组的赋值
  arr[j] = temp;
}

// 获取 DOM 元素的函数，保持不变
export function $(selector) {
  return document.querySelector(selector);
}

// 判断是否阻止拖放，保持不变
const components = ['VText', 'RectShape', 'CircleShape'];
export function isPreventDrop(component) {
  return !components.includes(component) && !component.startsWith('SVG');
}


//提取表达式的操作符
export function extractOperators(formula) {
  // 定义操作符字符，包括全角和半角
  const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／'];

  // 使用正则表达式匹配所有操作符
  const pattern = new RegExp(`[${operatorChars.join('')}]`, 'g');

  // 使用正则表达式匹配所有操作符
  const operators = formula.match(pattern) || [];

  // 输出每个操作符的 Unicode 编码以调试
  console.log('Extracted operators:');
  operators.forEach((op, index) => {
    console.log(`Operator ${index + 1}: '${op}' (Unicode: ${op.charCodeAt(0)})`);
  });

  // 输出公式中的每个字符及其 Unicode 编码
  console.log('Formula characters and their Unicode codes:');
  for (let i = 0; i < formula.length; i++) {
    console.log(`Character: '${formula[i]}' (Unicode: ${formula.charCodeAt(i)})`);
  }

  return operators;
}
//判断两个表达式是否是一个模版
export function compareOperatorSequences(expr1, expr2) {
  // 定义要匹配的操作符列表
  const operators = ['+', '-', '*', '/', '(', ')'];

  // 提取表达式中的操作符序列
  function extractOperators(expr) {
    const operatorSequence = [];
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (operators.includes(char)) {
        operatorSequence.push(char);
      }
    }
    return operatorSequence;
  }

  // 获取两个表达式的操作符序列
  const seq1 = extractOperators(expr1);
  const seq2 = extractOperators(expr2);

  // 比较操作符序列是否长度相同
  if (seq1.length !== seq2.length) {
    return false;
  }

  // 逐一比较操作符是否相同且顺序一致
  for (let i = 0; i < seq1.length; i++) {
    if (seq1[i] !== seq2[i]) {
      return false;
    }
  }

  // 如果所有操作符都匹配，返回 true
  return true;
}

//判断是否是合法公式
export function isValidFormula(formula) {
  const stack = [];
  const validCharacters = /^[A-Za-z0-9+\-*/()]+$/;

  // 检查是否只包含合法字符
  if (!validCharacters.test(formula)) {
    return false;
  }

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    // 如果是左括号，则压入栈中
    if (char === '(') {
      stack.push(char);
    }
    // 如果是右括号，则检查栈顶是否有匹配的左括号
    else if (char === ')') {
      if (stack.length === 0 || stack.pop() !== '(') {
        return false;
      }
    }
  }

  // 如果栈为空，则说明所有括号匹配，公式合法
  return stack.length === 0;
}
//提取包含min，max的用户名
export function extractUsernamesWithFunc(formula) {
  // 定义正则表达式，匹配非操作符和括号的部分
  const pattern = /[^+\-*/(),\s]+/g;

  // 使用正则表达式匹配所有的用户名部分
  const matches = formula.match(pattern);

  // 如果没有匹配结果，则返回空数组
  if (!matches) {
    return [];
  }

  return matches.filter(name => !['Min', 'Max', 'Min_Value', 'Max_Value'].includes(name));
}
//带有min，max的公式的合法性的判断
export function validateFormula(formula) {
  // 替换中文括号为英文括号，方便处理
  const normalizedFormula = formula.replace(/（/g, '(').replace(/）/g, ')');

  // 验证括号配对
  let stack = [];
  for (let char of normalizedFormula) {
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.length === 0) {
        return false; // 未闭合的右括号
      }
      stack.pop();
    }
  }
  if (stack.length !== 0) {
    return false; // 存在未闭合的左括号
  }

  // 验证操作符规则
  const operatorPattern = /[+\-*/]/;
  const tokenPattern = /[^+\-*/(),\s]+/g; // 提取非操作符、括号、逗号的部分

  // 拆分公式
  let tokens = normalizedFormula.split(/([\+\-\*/\(\)])/).filter(t => t.trim() !== '');

  // 检查开头或结尾不能是操作符
  if (operatorPattern.test(tokens[0]) || operatorPattern.test(tokens[tokens.length - 1])) {
    return false;
  }

  // 检查操作符不能连续出现
  for (let i = 0; i < tokens.length - 1; i++) {
    if (operatorPattern.test(tokens[i]) && operatorPattern.test(tokens[i + 1])) {
      return false;
    }
  }

  // 验证嵌套规则
  const functionPattern = /(Min|Max)\s*\(/;
  let parenthesesStack = [];
  for (let token of tokens) {
    if (functionPattern.test(token)) {
      parenthesesStack.push(token);
    } else if (token === ')') {
      if (parenthesesStack.length > 0) {
        parenthesesStack.pop();
      }
    }
  }

  return parenthesesStack.length === 0;
}



//提取表达式的用户名
export function extractUsernames(formula) {
  // 定义操作符字符，包括加减乘除和左右括号
  const operatorChars = ['+', '-', '*', '/', '(', ')'];

  // 使用正则表达式匹配所有操作符字符，并忽略两边的空格
  const pattern = new RegExp(`\\s*[\\${operatorChars.join('\\')}]+\\s*`, 'g');

  // 使用正则表达式分割字符串
  const tokens = formula.split(pattern);

  // 过滤掉空字符串，得到用户名列表
  const usernames = tokens.filter(token => token.trim() !== '');

  return usernames;
}
export function extractUsernamesAndBracket(formula) {
  // 定义操作符字符，包括全角和半角
  const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／', ' ', '　'];

  // 初始化结果数组，用来存储每个用户和括号信息
  let result = [];

  // 当前括号累积信息
  let bracketStack = '';

  // 当前用户名
  let username = '';

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    // 如果是操作符，则把之前累积的用户名加入结果
    if (operatorChars.includes(char)) {
      if (username !== '') {
        result.push({ username, bracket: bracketStack });
        username = '';
        bracketStack = ''; // 清空括号栈
      }
      continue; // 跳过操作符
    }

    // 如果是左括号 '(' 或 '（'，将其添加到括号栈中
    if (char === '(' || char === '（') {
      bracketStack += char;
      continue; // 继续下一轮循环
    }

    // 如果是右括号 ')' 或 '）'，将其添加到括号栈中
    if (char === ')' || char === '）') {
      bracketStack += char;
      continue; // 继续下一轮循环
    }

    // 如果是字母或其他字符（非操作符、非括号），继续累积用户名
    if (!operatorChars.includes(char)) {
      username += char;
    }
  }

  // 处理最后一个累积的用户名
  if (username !== '') {
    result.push({ username, bracket: bracketStack });
  }

  // 将结果转化为指定格式，拼装字符串
  return result.map(item => ({
    username: item.username,
    bracket: item.bracket
  }));
}
export function extractUsernamesAndBracketIncludeMaxOrMin(formula) {
  // 定义操作符字符，包括全角和半角
  const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／', ' ', '　'];
  const functionNames = ['max', 'min', 'min_value', 'max_value']; // 函数名称列表
  let result = []; // 结果数组
  let stack = []; // 栈用于记录括号内容
  let currentString = ''; // 当前用户字符串
  let inFunction = false; // 标记是否在函数模式中

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    // 遇到左括号，进入函数模式
    if (char === '(' || char === '（') {
      if (currentString.match(/^[a-zA-Z]+$/) && functionNames.includes(currentString)) {
        inFunction = true; // 标记进入函数模式
      }
      stack.push(char); // 入栈
      currentString += char; // 追加括号
      continue;
    }

    // 遇到右括号，出栈
    if (char === ')' || char === '）') {
      stack.pop(); // 出栈
      currentString += char; // 追加括号
      if (inFunction && stack.length === 0) {
        result.push({ username: currentString, bracket: '' }); // 添加完整函数为用户名
        currentString = ''; // 重置
        inFunction = false; // 退出函数模式
      }
      continue;
    }

    // 如果是操作符
    if (operatorChars.includes(char)) {
      if (currentString && !inFunction) {
        result.push({ username: currentString, bracket: '' }); // 添加普通用户名
        currentString = ''; // 重置
      }
      continue;
    }

    // 普通字符追加
    currentString += char;
  }

  // 处理最后一个累积的用户名
  if (currentString) {
    result.push({ username: currentString, bracket: '' });
  }

  return result;
}