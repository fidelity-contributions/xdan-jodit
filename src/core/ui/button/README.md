---
title: Button UI Element
description: The Jodit UI component for creating buttons used across the editor toolbar and interface elements.
keywords: jodit, button, ui element, toolbar button, ui component, interface
---

# Button UI Element

`UIButton` is the low-level component for building buttons anywhere in the editor UI —
toolbar controls, dialog footers, form actions, popups, etc. It renders a native
`<button>` with an icon slot and a text slot, and is driven by a mutable `state` object.

## Quick start

The `Button(...)` factory is the shortest way to create one:

```js
const { Button } = Jodit.modules;

// Button(view, iconName, text?, variant?)
const btn = Button(jodit, 'bold', 'Bold', 'primary');

btn.onAction(() => {
	jodit.execCommand('bold');
});

jodit.container.appendChild(btn.container);
```

`variant` (`ButtonVariant`) is one of `'initial' | 'outline' | 'default' | 'primary' |
'secondary' | 'success' | 'danger'` and controls the visual style.

## Constructing with an explicit state

For full control pass a partial state to the `UIButton` constructor (or via `setState`):

```js
const { UIButton } = Jodit.modules;

const btn = new UIButton(jodit, {
	name: 'save',
	text: 'Save',
	icon: { name: 'save' },
	variant: 'primary',
	size: 'large' // 'tiny' | 'xsmall' | 'small' | 'middle' | 'large'
});

btn.onAction(e => console.log('clicked', e));
```

`onAction` registers click handlers; multiple handlers can be added and they all fire on
click (a `click` event is also fired on the view's event bus).

## Updating state

The button reacts to changes on its `state` object — mutate it and the DOM updates
automatically (icon, text, tooltip, size, variant, disabled, activated, …):

```js
btn.state.disabled = true; // disables the <button>
btn.state.activated = true; // sets aria-pressed="true" (toggle look)
btn.state.text = 'Saved'; // re-renders the label (runs through i18n)
btn.setState({ variant: 'success' }); // batch update, chainable

btn.focus(); // move focus to the button
btn.isFocused(); // boolean
```

Tooltips come from `state.tooltip`: it is exposed as `aria-label` (and, when
`useNativeTooltip` is enabled, as the native `title`) and is rendered by the
[[UITooltip]] component. Text passed to `text`/`tooltip` is translated via `jodit.i18n`.

> For toolbar buttons defined through editor `buttons`/`controls` config, use the
> higher-level `makeButton` factory in `modules/toolbar/factory.ts`, which wires a
> [[IControlType]] control (commands, popups, lists, `isActive`/`isDisabled`, …) onto a
> `UIButton`.
