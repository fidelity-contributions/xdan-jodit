/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2025 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/clean-html
 */

import type { IJodit, Nullable } from 'jodit/types';
import { INVISIBLE_SPACE_REG_EXP as INV_REG } from 'jodit/core/constants';
import { Dom } from 'jodit/core/dom/dom';

/**
 * @private
 */
export function removeInvTextNodes(
	jodit: IJodit,
	node: Node,
	hadEffect: boolean,
	arg: unknown,
	argi: unknown,
	currentNode: Nullable<Node>
): boolean {
	if (currentNode === node || !Dom.isText(node) || node.nodeValue == null) {
		return hadEffect;
	}

	if (!INV_REG().test(node.nodeValue)) {
		return hadEffect;
	}

	const focusBox = Dom.furthest(currentNode, Dom.isBlock, jodit.editor);

	if (!focusBox || Dom.isOrContains(focusBox, node)) {
		return hadEffect;
	}

	node.nodeValue = node.nodeValue.replace(INV_REG(), '');

	if (node === currentNode && jodit.s.isCollapsed()) {
		jodit.s.setCursorAfter(node);
	}

	if (!node.nodeValue) {
		Dom.safeRemove(node);
	}

	return true;
}
