/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2025 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * You can use Jodit constants in your code
 * ```javascript
 * import { Jodit } from 'jodit';
 * console.log(Jodit.constants.IS_IE);
 * console.log(Jodit.constants.APP_VERSION);
 * ```
 * @packageDocumentation
 * @module constants
 */

import type { HTMLTagNames, IDictionary } from 'jodit/types';

export const APP_VERSION = process.env.APP_VERSION as string;
// prettier-ignore
export const ES: 'es5' | 'es2015' | 'es2018' | 'es2021' = process.env.TARGET_ES as 'es2015';
export const IS_ES_MODERN = process.env.IS_ES_MODERN as unknown as boolean;
export const IS_ES_NEXT = process.env.IS_ES_NEXT as unknown as boolean;
export const IS_PROD = process.env.IS_PROD as unknown as boolean;
export let IS_TEST = process.env.IS_TEST as unknown as boolean;
export const FAT_MODE = process.env.FAT_MODE as unknown as boolean;
export const HOMEPAGE = process.env.HOMEPAGE as string;
export const SET_TEST = (): boolean => (IS_TEST = true);
export const TOKENS = process.env.TOKENS as unknown as Record<string, string>;

export const INVISIBLE_SPACE = '\uFEFF';
export const NBSP_SPACE = '\u00A0';
export const INVISIBLE_SPACE_REG_EXP = (): RegExp => /[\uFEFF]/g;
export const INVISIBLE_SPACE_REG_EXP_END = (): RegExp => /[\uFEFF]+$/g;
export const INVISIBLE_SPACE_REG_EXP_START = (): RegExp => /^[\uFEFF]+/g;

export const SPACE_REG_EXP = (): RegExp => /[\s\n\t\r\uFEFF\u200b]+/g;
export const SPACE_REG_EXP_START = (): RegExp => /^[\s\n\t\r\uFEFF\u200b]+/g;
export const SPACE_REG_EXP_END = (): RegExp => /[\s\n\t\r\uFEFF\u200b]+$/g;

export const globalWindow: typeof window =
	typeof window !== 'undefined' ? window : (undefined as typeof window);

export const globalDocument: Document =
	typeof document !== 'undefined'
		? document
		: (undefined as unknown as Document);

export const IS_BLOCK =
	/^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|CANVAS|DD|DFN|DIV|DL|DT|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H[1-6]|HEADER|HGROUP|HR|LI|MAIN|NAV|NOSCRIPT|OUTPUT|P|PRE|RUBY|SCRIPT|STYLE|OBJECT|OL|SECTION|IFRAME|JODIT|JODIT-MEDIA|UL|TR|TD|TH|TBODY|THEAD|TFOOT|TABLE|BODY|HTML|VIDEO)$/i;

export const IS_INLINE = /^(STRONG|SPAN|I|EM|B|SUP|SUB|A|U)$/i;

export const LIST_TAGS = new Set(['ul', 'ol'] as const);
const __UNSEPARABLE_TAGS = [
	'img',
	'video',
	'svg',
	'iframe',
	'script',
	'input',
	'textarea',
	'link',
	'jodit',
	'jodit-media'
] as const;

export const INSEPARABLE_TAGS: Set<HTMLTagNames> = new Set([
	...__UNSEPARABLE_TAGS,
	'br',
	'hr'
] as const);

export const NO_EMPTY_TAGS: Set<HTMLTagNames> = new Set(__UNSEPARABLE_TAGS);

export const KEY_META = 'Meta';
export const KEY_BACKSPACE = 'Backspace';
export const KEY_TAB = 'Tab';
export const KEY_ENTER = 'Enter';
export const KEY_ESC = 'Escape';
export const KEY_ALT = 'Alt';

export const KEY_LEFT = 'ArrowLeft';
export const KEY_UP = 'ArrowUp';
export const KEY_RIGHT = 'ArrowRight';
export const KEY_DOWN = 'ArrowDown';
export const KEY_SPACE = 'Space';

export const KEY_DELETE = 'Delete';

export const KEY_F3 = 'F3';

export const NEARBY = 5;
export const ACCURACY = 10;

export const COMMAND_KEYS = [
	KEY_META,
	KEY_BACKSPACE,
	KEY_DELETE,
	KEY_UP,
	KEY_DOWN,
	KEY_RIGHT,
	KEY_LEFT,
	KEY_ENTER,
	KEY_ESC,
	KEY_F3,
	KEY_TAB
];

export const BR = 'br';
export const PARAGRAPH = 'p';

/**
 * WYSIWYG editor mode
 */
export const MODE_WYSIWYG = 1;

/**
 * html editor mode
 */
export const MODE_SOURCE = 2;

/**
 * Source code editor and HTML editor both like
 * @see http://getuikit.com/docs/htmleditor.html|this
 */
export const MODE_SPLIT = 3;

/**
 * Is Internet Explorer
 */
export const IS_IE =
	typeof navigator !== 'undefined' &&
	(navigator.userAgent.indexOf('MSIE') !== -1 ||
		/rv:11.0/i.test(navigator.userAgent));

/**
 * For IE11 it will be 'text'. Need for dataTransfer.setData
 */
export const TEXT_PLAIN = IS_IE ? 'text' : 'text/plain';
export const TEXT_HTML = IS_IE ? 'html' : 'text/html';
export const TEXT_RTF = IS_IE ? 'rtf' : 'text/rtf';

export const MARKER_CLASS = 'jodit-selection_marker';

export const EMULATE_DBLCLICK_TIMEOUT = 300;

/**
 * Paste the copied text as HTML, all content will be pasted exactly as it was on the clipboard.
 * So how would you copy its code directly into the source document.
 * ```
 * <h1 style="color:red">test</h1>
 * ```
 * Will be inserted into the document as
 * ```
 * <h1 style="color:red">test</h1>
 * ```
 */
export const INSERT_AS_HTML = 'insert_as_html';

/**
 * Same as [[INSERT_AS_HTML]], but content will be stripped of extra styles and empty tags
 * ```html
 * <h1 style="color:red">test</h1>
 * ```
 * Will be inserted into the document as
 * ```html
 * <h1>test</h1>
 * ```
 */
export const INSERT_CLEAR_HTML = 'insert_clear_html';

/**
 * The contents of the clipboard will be pasted into the document as plain text, i.e. all tags will be displayed as text.
 * ```html
 * <h1>test</h1>
 * ```
 * Will be inserted into the document as
 * ```html
 * &gt;&lt;h1&gt;test&lt;/h1&gt;
 * ```
 */
export const INSERT_AS_TEXT = 'insert_as_text';

/**
 * All tags will be stripped:
 * ```html
 * <h1>test</h1>
 * ```
 * Will be inserted into the document as
 * ```html
 * test
 * ```
 */
export const INSERT_ONLY_TEXT = 'insert_only_text';

export const SAFE_COUNT_CHANGE_CALL = 10;

export const IS_MAC =
	typeof globalWindow !== 'undefined' &&
	/Mac|iPod|iPhone|iPad/.test(globalWindow.navigator.platform);

export const KEY_ALIASES: IDictionary<string> = {
	add: '+',
	break: 'pause',
	cmd: 'meta',
	command: 'meta',
	ctl: 'control',
	ctrl: 'control',
	del: 'delete',
	down: 'arrowdown',
	esc: 'escape',
	ins: 'insert',
	left: 'arrowleft',
	mod: IS_MAC ? 'meta' : 'control',
	opt: 'alt',
	option: 'alt',
	return: 'enter',
	right: 'arrowright',
	space: 'space',
	spacebar: 'space',
	up: 'arrowup',
	win: 'meta',
	windows: 'meta'
};

const removeScriptName = (
	src: string
): {
	basePath: string;
	isMin: boolean;
} => {
	const parts = src.split('/');
	const isMin =
		typeof process.env.MINIFIED === 'boolean'
			? process.env.MINIFIED
			: /\.min\.js/.test(src);

	if (/\.js/.test(parts[parts.length - 1])) {
		return {
			basePath: parts.slice(0, parts.length - 1).join('/') + '/',
			isMin
		};
	}

	return {
		basePath: src,
		isMin
	};
};

const { basePath, isMin } = ((): {
	basePath: string;
	isMin: boolean;
} => {
	if (typeof document === 'undefined') {
		return {
			basePath: '',
			isMin: Boolean(process.env.MINIFIED as unknown as boolean)
		};
	}

	const script = globalDocument.currentScript as HTMLScriptElement;

	if (script) {
		return removeScriptName(script.src);
	}

	const scripts =
		globalDocument.querySelectorAll<HTMLScriptElement>('script[src]');

	if (scripts && scripts.length) {
		return removeScriptName(scripts[scripts.length - 1].src);
	}

	return removeScriptName(globalWindow.location.href);
})();

/**
 * Path to the current script
 */
export const BASE_PATH: string = basePath;

/**
 * Current script is minified
 */
export const BASE_PATH_IS_MIN: boolean = isMin;

export const TEMP_ATTR = 'data-jodit-temp';

export const lang: IDictionary<IDictionary<string>> = {};

export const CLIPBOARD_ID = 'clipboard';
export const SOURCE_CONSUMER = 'source-consumer';

export const PASSIVE_EVENTS = new Set([
	'touchstart',
	'touchend',
	'scroll',
	'mousewheel',
	'mousemove',
	'touchmove'
]);
