/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2025 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * [[include:plugins/link/README.md]]
 * @packageDocumentation
 * @module plugins/link
 */

import type { IDictionary, IJodit, IUIForm, Nullable } from 'jodit/types';
import type { UIForm } from 'jodit/core/ui/form/form';
import { autobind } from 'jodit/core/decorators';
import { Dom } from 'jodit/core/dom';
import { pluginSystem } from 'jodit/core/global';
import {
	attr,
	call,
	convertMediaUrlToVideoEmbed,
	isString,
	isURL,
	refs,
	stripTags
} from 'jodit/core/helpers';
import { Plugin } from 'jodit/core/plugin';

import './config';

/**
 * Process link. Insert, dblclick or remove format
 */
export class link extends Plugin {
	/** @override */
	override buttons: Plugin['buttons'] = [
		{
			name: 'link',
			group: 'insert'
		}
	];

	/** @override */
	protected override afterInit(jodit: IJodit): void {
		if (jodit.o.link.followOnDblClick) {
			jodit.e.on('dblclick.link', this.__onDblClickOnLink);
		}

		jodit.e.on(jodit.editor, 'click.link', this.__onClickReadOnlyLink);

		if (jodit.o.link.processPastedLink) {
			jodit.e.on('processPaste.link', this.onProcessPasteLink);
		}

		jodit.e.on('generateLinkForm.link', this.__generateForm);

		jodit.registerCommand('openLinkDialog', {
			exec: () => {
				const dialog = jodit.dlg({
					resizable: false
				});

				const htmlForm = this.__generateForm(jodit.s.current(), () => {
					dialog.close();
				}) as UIForm;

				htmlForm.container.classList.add('jodit-dialog_alert');
				dialog.setContent(htmlForm);
				dialog.open();

				jodit.async.requestIdleCallback(() => {
					const { url_input } = refs(htmlForm.container);
					url_input?.focus();
				});
			},
			hotkeys: jodit.o.link.hotkeys
		});
	}

	@autobind
	private __onDblClickOnLink(e: MouseEvent): void {
		if (!Dom.isTag(e.target, 'a')) {
			return;
		}

		const href = attr(e.target, 'href');

		if (href) {
			location.href = href;
			e.preventDefault();
		}
	}

	@autobind
	private onProcessPasteLink(
		ignore: ClipboardEvent,
		html: string
	): HTMLAnchorElement | void | true {
		const { jodit } = this;

		if (!isURL(html) || !jodit.o.link.processPastedLink) {
			return;
		}

		jodit.e.stopPropagation('processPaste');

		if (jodit.o.link.processVideoLink) {
			const embed = call(
				jodit.o.video?.parseUrlToVideoEmbed ??
					convertMediaUrlToVideoEmbed,
				html,
				{
					width: jodit.o.video?.defaultWidth,
					height: jodit.o.video?.defaultHeight
				}
			);

			if (embed !== html) {
				return jodit.createInside.fromHTML(embed) as HTMLAnchorElement;
			}
		}

		if (jodit.s.isCollapsed()) {
			const a = jodit.createInside.element('a');

			a.setAttribute('href', html);
			a.textContent = html;

			jodit.e.fire('applyLink', jodit, a, null);
			return a;
		}

		jodit.s.commitStyle({
			element: 'a',
			attributes: {
				href: html
			}
		});

		return true;
	}

	@autobind
	private __generateForm(
		current: Nullable<Node>,
		close: Function
	): HTMLElement | IUIForm {
		const { jodit } = this;

		const i18n = jodit.i18n.bind(jodit),
			{
				openInNewTabCheckbox,
				noFollowCheckbox,
				formTemplate,
				formClassName,
				modeClassName
			} = jodit.o.link;

		const html = formTemplate(jodit);
		const form = isString(html)
			? (jodit.c.fromHTML(html, {
					target_checkbox_box: openInNewTabCheckbox,
					nofollow_checkbox_box: noFollowCheckbox
				}) as HTMLFormElement)
			: html;
		const htmlForm = Dom.isElement(form) ? form : form.container;

		const elements = refs(htmlForm);
		const { insert, unlink, content_input_box } = elements;
		const { target_checkbox, nofollow_checkbox, url_input } =
			elements as IDictionary<HTMLInputElement>;
		const currentElement = current;
		const isImageContent = Dom.isImage(currentElement);

		let { content_input } = elements as IDictionary<HTMLInputElement>;

		const { className_input } = elements as IDictionary<HTMLInputElement>,
			{ className_select } = elements as IDictionary<HTMLSelectElement>;

		if (!content_input) {
			content_input = jodit.c.element('input', {
				type: 'hidden',
				ref: 'content_input'
			});
		}

		if (formClassName) {
			htmlForm.classList.add(formClassName);
		}

		if (isImageContent) {
			Dom.hide(content_input_box);
		}

		let link: false | HTMLAnchorElement;

		const getSelectionText = (): string =>
			link
				? link.innerText
				: stripTags(jodit.s.range.cloneContents(), jodit.ed);

		if (current && Dom.closest(current, 'a', jodit.editor)) {
			link = Dom.closest(current, 'a', jodit.editor) as HTMLAnchorElement;
		} else {
			link = false;
		}

		if (!isImageContent && current) {
			content_input.value = getSelectionText();
		}

		if (link) {
			url_input.value = attr(link, 'href') || '';

			if (modeClassName) {
				readClassnames(
					modeClassName,
					className_input,
					link,
					className_select
				);
			}

			if (openInNewTabCheckbox && target_checkbox) {
				target_checkbox.checked = attr(link, 'target') === '_blank';
			}

			if (noFollowCheckbox && nofollow_checkbox) {
				nofollow_checkbox.checked = attr(link, 'rel') === 'nofollow';
			}

			insert.textContent = i18n('Update');
		} else {
			Dom.hide(unlink);
		}

		jodit.editor.normalize();
		const snapshot = jodit.history.snapshot.make();

		if (unlink) {
			jodit.e.on(unlink, 'click', (e: MouseEvent) => {
				jodit.s.restore();
				jodit.history.snapshot.restore(snapshot);

				if (link) {
					Dom.unwrap(link);
				}

				jodit.synchronizeValues();

				close();
				e.preventDefault();
			});
		}

		const onSubmit = (): false => {
			if (!url_input.value.trim().length) {
				url_input.focus();
				url_input.classList.add('jodit_error');
				return false;
			}

			let links: HTMLAnchorElement[];

			jodit.s.restore();
			jodit.s.removeMarkers();
			jodit.editor.normalize();
			jodit.history.snapshot.restore(snapshot);

			const textWasChanged =
				getSelectionText() !== content_input.value.trim();

			const ci = jodit.createInside;

			if (!link || !Dom.isOrContains(jodit.editor, link)) {
				if (!jodit.s.isCollapsed()) {
					const node = jodit.s.current();

					if (Dom.isTag(node, 'img')) {
						links = [Dom.wrap(node, 'a', ci) as HTMLAnchorElement];
					} else {
						links = jodit.s.wrapInTag('a') as HTMLAnchorElement[];
					}
				} else {
					const a = ci.element('a');
					jodit.s.insertNode(a, false, false);
					links = [a];
				}

				links.forEach(link => jodit.s.select(link));
			} else {
				links = [link];
			}

			links.forEach(a => {
				attr(a, 'href', url_input.value);

				writeClasses(
					modeClassName,
					className_input,
					className_select,
					a
				);

				if (!isImageContent) {
					writeImage(a, content_input, textWasChanged, url_input);
				}

				if (openInNewTabCheckbox && target_checkbox) {
					attr(
						a,
						'target',
						target_checkbox.checked ? '_blank' : null
					);
				}

				if (noFollowCheckbox && nofollow_checkbox) {
					attr(
						a,
						'rel',
						nofollow_checkbox.checked ? 'nofollow' : null
					);
				}

				jodit.e.fire('applyLink', jodit, a, form);
			});

			jodit.synchronizeValues();

			close();

			return false;
		};

		if (Dom.isElement(form)) {
			jodit.e.on(form, 'submit', (event: SubmitEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				onSubmit();
				return false;
			});
		} else {
			form.onSubmit(onSubmit);
		}

		return form;
	}

	/** @override */
	protected override beforeDestruct(jodit: IJodit): void {
		jodit.e
			.off('generateLinkForm.link', this.__generateForm)
			.off('dblclick.link', this.__onDblClickOnLink)
			.off(jodit.editor, 'click.link', this.__onClickReadOnlyLink)
			.off('processPaste.link', this.onProcessPasteLink);
	}

	@autobind
	private __onClickReadOnlyLink(e: MouseEvent): void {
		const { jodit } = this;

		if (
			jodit.o.readonly &&
			jodit.o.link.preventReadOnlyNavigation &&
			Dom.isTag(e.target, 'a')
		) {
			e.preventDefault();
		}
	}
}

pluginSystem.add('link', link);

function writeClasses(
	modeClassName: any,
	className_input: HTMLInputElement,
	className_select: HTMLSelectElement,
	a: HTMLAnchorElement
): void {
	if (modeClassName && (className_input ?? className_select)) {
		if (modeClassName === 'input') {
			if (className_input.value === '' && a.hasAttribute('class')) {
				attr(a, 'class', null);
			}

			if (className_input.value !== '') {
				attr(a, 'class', className_input.value);
			}
		} else if (modeClassName === 'select') {
			if (a.hasAttribute('class')) {
				attr(a, 'class', null);
			}

			for (let i = 0; i < className_select.selectedOptions.length; i++) {
				const className =
					className_select.selectedOptions.item(i)?.value;

				if (className) {
					a.classList.add(className);
				}
			}
		}
	}
}

function readClassnames(
	modeClassName: any,
	className_input: HTMLInputElement,
	link: HTMLAnchorElement,
	className_select: HTMLSelectElement
): void {
	switch (modeClassName) {
		case 'input':
			if (className_input) {
				className_input.value = attr(link, 'class') || '';
			}
			break;

		case 'select':
			if (className_select) {
				for (
					let i = 0;
					i < className_select.selectedOptions.length;
					i++
				) {
					const option = className_select.options.item(i);

					if (option) {
						option.selected = false;
					}
				}

				const classNames = attr(link, 'class') || '';

				classNames.split(' ').forEach(className => {
					if (className) {
						for (
							let i = 0;
							i < className_select.options.length;
							i++
						) {
							const option = className_select.options.item(i);

							if (option?.value && option.value === className) {
								option.selected = true;
							}
						}
					}
				});
			}
			break;
	}
}

function writeImage(
	a: HTMLAnchorElement,
	content_input: HTMLInputElement,
	textWasChanged: boolean,
	url_input: HTMLInputElement
): void {
	let newContent = a.textContent;

	if (content_input.value.trim().length) {
		if (textWasChanged) {
			newContent = content_input.value;
		}
	} else {
		newContent = url_input.value;
	}

	const content = a.textContent;

	if (newContent !== content) {
		a.textContent = newContent;
	}
}
