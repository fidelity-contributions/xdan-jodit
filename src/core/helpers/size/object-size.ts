/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2025 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module helpers/size
 */

import type { CanUndef } from 'jodit/types';
import { isArray, isPlainObject, isString } from 'jodit/core/helpers/checker';

export function size(
	subject: CanUndef<object | string | Array<unknown>>
): number {
	if (isString(subject) || isArray(subject)) {
		return subject.length;
	}

	if (isPlainObject(subject)) {
		return Object.keys(subject).length;
	}

	return 0;
}
