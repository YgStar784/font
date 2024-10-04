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

  // 创建一个正则表达式，用于匹配所有操作符字符
  const pattern = new RegExp('[' + operatorChars.join('') + ']', 'g');

  // 使用正则表达式匹配所有操作符
  const operators = formula.match(pattern);

  // 如果没有找到操作符，返回空数组，否则返回操作符数组
  return operators || [];
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


//提取表达式的用户名
export function extractUsernames(formula) {
  // 定义操作符字符，包括全角和半角
  const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／', '(', '（', ')', '）', ' ', '　'];

  // 创建一个正则表达式，匹配所有操作符字符
  const pattern = new RegExp('[' + operatorChars.join('') + ']+', 'g');

  // 使用正则表达式分割字符串
  const tokens = formula.split(pattern);

  // 过滤掉空字符串，得到用户名列表
  const usernames = tokens.filter(token => token !== '');

  return usernames;
}

export function extractUsernamesAndBracket(formula) {
  // 定义操作符字符，包括全角和半角
  const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／', ' ', '　'];

  // 初始化结果数组，用来存储每个用户和括号信息
  let result = [];

  // 用栈来记录左括号的出现位置
  let leftBracketStack = [];

  // 当前用户名
  let username = '';

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    // 如果是操作符，则把之前累积的用户名加入结果
    if (operatorChars.includes(char)) {
      if (username !== '') {
        result.push({ username, bracket: '' });
        username = '';
      }
    }

    // 如果是左括号 '(' 或 '（'，将其位置压入栈
    if (char === '(' || char === '（') {
      leftBracketStack.push(result.length); // 记录括号前的用户名索引
    }

    // 如果是右括号 ')' 或 '）'
    if (char === ')' || char === '）') {
      const leftIndex = leftBracketStack.pop(); // 找到与之匹配的左括号
      if (leftIndex !== undefined && result[leftIndex]) {
        result[leftIndex].bracket = '('; // 给相应的用户名加上左括号
      }
      if (username !== '') {
        result.push({ username, bracket: ')' }); // 当前用户名加上右括号
        username = '';
      } else if (result.length > 0) {
        result[result.length - 1].bracket = ')'; // 最后一个用户加上右括号
      }
    }

    // 如果是字母，继续累积用户名
    if (!operatorChars.includes(char) && char !== '(' && char !== ')' && char !== '（' && char !== '）') {
      username += char;
    }
  }

  // 处理最后一个累积的用户名
  if (username !== '') {
    result.push({ username, bracket: '' });
  }

  return result;
}