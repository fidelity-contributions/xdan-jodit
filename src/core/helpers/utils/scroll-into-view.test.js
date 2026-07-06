/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

describe('Helper inView', () => {
	const { inView } = Jodit.modules.Helpers;

	const make = topPx => {
		const box = document.createElement('div');
		box.style.cssText = `position:fixed;left:0;width:100px;height:100px;top:${topPx}px;`;

		const child = document.createElement('p');
		child.style.cssText = 'height:100px;margin:0;';
		box.appendChild(child);

		document.body.appendChild(box);
		return { box, child };
	};

	// https://github.com/xdan/jodit/issues/1279
	it('Should return false for an element scrolled above the viewport top', () => {
		const { box, child } = make(-200);
		try {
			expect(inView(child, box, document)).is.false;
		} finally {
			box.remove();
		}
	});

	it('Should return true for an element within the viewport', () => {
		const { box, child } = make(10);
		try {
			expect(inView(child, box, document)).is.true;
		} finally {
			box.remove();
		}
	});

	it('Should return false for an element below the viewport bottom', () => {
		const { box, child } = make(window.innerHeight + 200);
		try {
			expect(inView(child, box, document)).is.false;
		} finally {
			box.remove();
		}
	});
});
