/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2025 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * [[include:modules/context-menu/README.md]]
 * @packageDocumentation
 * @module modules/context-menu
 */

import type { IContextMenu, IContextMenuAction } from 'jodit/types';
import { component } from 'jodit/core/decorators/component/component';
import { isArray } from 'jodit/core/helpers/checker/is-array';
import { Button } from 'jodit/core/ui/button/button/button';
import { Popup } from 'jodit/core/ui/popup/popup';

import './context-menu.less';

/**
 * Module to generate context menu
 */
@component
export class ContextMenu extends Popup implements IContextMenu {
	/** @override */
	override className(): string {
		return 'ContextMenu';
	}

	/**
	 * Generate and show context menu
	 *
	 * @param x - Global coordinate by X
	 * @param y - Global coordinate by Y
	 * @param actions - Array with plain objects `{icon: 'bin', title: 'Delete', exec: function () {}}`
	 * @example
	 * ```javascript
	 * parent.show(e.clientX, e.clientY, [{icon: 'bin', title: 'Delete', exec: function () { alert(1) }}]);
	 * ```
	 */
	show(
		x: number,
		y: number,
		actions: Array<false | IContextMenuAction>
	): void {
		const self = this;

		self.clear();

		if (!isArray(actions)) {
			return;
		}

		actions.forEach(item => {
			if (!item) {
				return;
			}

			const action = Button(this.jodit, item.icon || 'empty', item.title);
			this.jodit && action.setParentView(this.jodit);

			action.setMod('context', 'menu');

			action.onAction((e: MouseEvent) => {
				item.exec?.call(self, e);
				self.clear();
				self.close();
				return false;
			});

			this.append(action);
		});

		this.open(() => ({ left: x, top: y, width: 0, height: 0 }), true);
	}
}
