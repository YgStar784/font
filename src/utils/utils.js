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