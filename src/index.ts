import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';
import { ParseUserScript } from './types/UserScript.ts';

/**
 * Vite 插件：
 *
 * 为 网页脚本 自动注入对自身构建产物的 @require 自引用，
 * 仅作用于包含 // ==UserScript== 标识的输出 chunk。
 *
 * 插件会在 UserScript 元数据块（// ==UserScript== ... // ==/UserScript==）
 * 结束前插入一行：
 *   // @require <file:///文件绝对路径>
 *
 * 如果该行已存在，则跳过插入，避免重复。
 */
export default function requireSelfPlugin( isInsert: boolean = true ): Plugin {
	/**
	 * 绝对输出目录
	 */
	let outDirAbsolute = '';
	let parsedUserScript: ParseUserScript | undefined;
	
	
	return {
		name: 'vite-plugin-scriptcat-require-self',
		version: '1.0.0',
		
		/**
		 * 获取 vite-plugin-scriptcat-meta-banner 脚本导出的 UserScript
		 */
		buildStart( { plugins } ) {
			const metaPlugin = plugins.find( plugin => plugin.name === 'vite-plugin-scriptcat-meta-banner' );
			if ( !metaPlugin ) return;
			parsedUserScript = metaPlugin.api.parsedUserScript;
		},
		
		/**
		 * 在 Vite 配置解析完成后，缓存绝对输出目录路径。
		 */
		configResolved( config ) {
			// 获取绝对输出目录
			const outDir = config.build.outDir || 'dist';
			outDirAbsolute = resolve( config.root || process.cwd(), outDir );
		},
		
		/**
		 * 在 bundle 生成阶段后执行，遍历所有输出 chunk，
		 * 为符合 UserScript 格式的脚本注入自引用 @require。
		 */
		generateBundle: {
			order: 'post',  // 后执行
			handler( _, bundle ) {
				// 判断是否需要执行
				if ( !isInsert ) return;
				
				for ( const fileName in bundle ) {
					const file = bundle[ fileName ];
					if ( file.type !== 'chunk' || !fileName.endsWith( 'js' ) ) continue;
					
					const trimmedCode = file.code.trim();
					// 判断当前文件是否为脚本 (头部是否存在 UserScript 标识)
					// 精确匹配 UserScript 元数据块结尾
					const userScriptEndMatch = trimmedCode.match( /(\/\/\s*==\/UserScript==)/ );
					if ( !userScriptEndMatch ) continue;
					
					// 读取文件路径
					const filePath = join( outDirAbsolute, fileName );
					const fileUrl = pathToFileURL( filePath );
					
					// 判断当前文件是否存在自引用, 如果存在则跳过
					if ( new RegExp( `//\\s*@require\\s+${fileUrl}` ).test( trimmedCode ) ) {
						continue;
					}
					
					let indent: number = 0;
					if ( parsedUserScript ) {
						indent = parsedUserScript.maxKeyLength;
					}
					else {
						// 获取前一个键名的长度用于对齐
						const [ , , key ] = trimmedCode.match( /\/\/(\s*)@(\w+\s+).*\r?\n\/\/\s*==\/UserScript==/ ) || [];
						indent = key ? key.length - 4 : 0;
					}
					
					
					const requireSelfLine = `// @${ 'require'.padEnd( indent, ' ' ) }    ${ fileUrl }\n`;
					
					// 定位插入位置：紧邻 // ==/UserScript== 之前
					const insertPosition = userScriptEndMatch.index;
					// 插入新行
					file.code =
						trimmedCode.slice( 0, insertPosition ) +
						requireSelfLine +
						trimmedCode.slice( insertPosition );
				}
			},
		},
	};
}
