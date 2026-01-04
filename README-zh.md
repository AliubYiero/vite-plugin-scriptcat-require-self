# Vite Plugin ScriptCat Require Self

[English](./README.md) / 中文

## 功能

自动向网页脚本 (如 TamperMonkey / ScriptCat ) 的 UserScript 头部注入引用, 引用内容为打包完成的本地文件: `// @require <dist-bundle.js>`.

## 安装

```bash
npm install @yiero/vite-plugin-scriptcat-require-self -D
# or
yarn add @yiero/vite-plugin-scriptcat-require-self -D
# or
pnpm add @yiero/vite-plugin-scriptcat-require-self -D
```

## 配置

| 参数       | 类型      | 描述                                               | 默认值 |
| ---------- | --------- | -------------------------------------------------- | ------ |
| `isInsert` | `boolean` | 是否注入引用, 可以通过**环境变量**决定是否注入引用 | `true` |

## 使用

在 `vite.config.js` 中添加插件：

```ts
import { defineConfig } from 'vite'
import requireSelfPlugin from '@yiero/vite-plugin-scriptcat-require-self'

export default defineConfig( ( env ) => {
	/*
	* 获取当前的构建环境
	* */
	const isDevelopment = env.mode === 'development';
    plugins: [
        // 其他插件...
        
        // 如果是开发环境则输出 true, 自动注入本地文件引用
        // 反之输出 false, 插件不进行任何工作
        requireSelfPlugin( isDevelopment )
	],	
})
```

---

在 `package.json` 中添加: 

```json
{
    // 其他配置...
	"scripts": {
		"dev": "vite build --mode development",
		"build": "vite build --mode production",
        
        // 其他命令...
	}
}
```

## 工作原理

插件会自动执行以下操作：

1. 通过检测 `// ==UserScript==` 标识识别 UserScript 文件
2. 生成输出脚本的绝对文件 URL
3. 检查是否已存在自引用的 `@require` 指令
4. 在 `// ==/UserScript==` 闭合标识前注入 `// @require <文件URL>`（如果不存在）

**处理前：**
```js
// ==UserScript==
// @name        我的脚本
// @namespace   https://example.com
// @version     1.0
// ==/UserScript==

console.log('Hello from UserScript!');
```

**构建后：**
```js
// ==UserScript==
// @name        我的脚本
// @namespace   https://example.com
// @version     1.0
// @require     file:///项目路径/dist/script.js
// ==/UserScript==

console.log('Hello from UserScript!');
```



## 贡献指南

欢迎贡献！请通过 [GitHub](https://github.com/your-username/vite-plugin-scriptcat-require-self) 提交 issue 或 PR。



## 许可证

GPL-3 © [AliubYiero](https://github.com/AliubYiero)
