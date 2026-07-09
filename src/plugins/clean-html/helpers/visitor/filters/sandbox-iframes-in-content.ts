/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/clean-html
 */

import type { IJodit } from 'jodit/types';
import { Dom } from 'jodit/core/dom/dom';
import { attr } from 'jodit/core/helpers/utils/attr';

import { isAllowedMediaEmbed } from '../../is-allowed-media-embed';

/**
 * Add `sandbox=""` attribute to all `<iframe>` elements in the editor content
 * @private
 */
export function sandboxIframesInContent(
	jodit: IJodit,
	nodeElm: Node,
	hadEffect: boolean
): boolean {
	if (
		!jodit.o.cleanHTML.sandboxIframesInContent ||
		!Dom.isElement(nodeElm) ||
		nodeElm.nodeName !== 'IFRAME'
	) {
		return hadEffect;
	}

	const elm = nodeElm as HTMLIFrameElement;

	// A trusted YouTube/Vimeo player (inserted via the Video button) must not
	// get an empty `sandbox=""` — that blocks scripts and stops playback. It
	// is served in its own third-party origin, so leave it as-is (#1381).
	if (isAllowedMediaEmbed(attr(elm, 'src') || '')) {
		return hadEffect;
	}

	if (!elm.hasAttribute('sandbox')) {
		attr(elm, 'sandbox', '');
		return true;
	}

	return hadEffect;
}
