// localstorage.js

const localstorage = {
    set(key, value) {
        if (typeof window.localStorage !== 'undefined') {
            // 浏览器支持 Localstorage
            window.localStorage.setItem(key, JSON.stringify(value));
        } else {
            // 浏览器不支持 Localstorage，使用备用存储方式
            // 例如 Cookies
        }
    },
    get(key) {
        if (typeof window.localStorage !== 'undefined') {
            // 浏览器支持 Localstorage
            const value = window.localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } else {
            // 浏览器不支持 Localstorage，使用备用存储方式
            // 例如 Cookies
            return null;
        }
    },
    remove(key) {
        if (typeof window.localStorage !== 'undefined') {
            // 浏览器支持 Localstorage
            window.localStorage.removeItem(key);
        } else {
            // 浏览器不支持 Localstorage，使用备用存储方式
            // 例如 Cookies
        }
    },
};
export default localstorage;
