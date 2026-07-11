---
title: Group UI Component
description: A container UI component used to group other components together, such as grouping buttons within the editor toolbar.
keywords: jodit, group, ui component, container, toolbar group, button group
---

# Group component

`UIGroup` is a container for other UI elements. It holds a list of children (buttons,
inputs, nested groups, …), renders their containers into its own container, and can
broadcast state to them. It is the base class for higher-level containers such as
[[UIList]], [[UIForm]], [[UIBlock]] and [[Popup]].

## Basic usage

```js
const { UIGroup, Button } = Jodit.modules;

const group = new UIGroup(jodit, [
	Button(jodit, 'bold'),
	Button(jodit, 'italic'),
	Button(jodit, 'underline')
]);

jodit.container.appendChild(group.container);
```

Pass the children as the second constructor argument (falsy entries are skipped, which is
handy for conditional items), and an optional `options` dictionary as the third — `name`
sets the group's element name, `role` overrides the ARIA role (default `list`).

## Managing children

```js
group.append(Button(jodit, 'strikethrough')); // add to the end
group.append(btn, 0); // insert at index 0
group.append([btnA, btnB]); // append several at once
group.append(btn, 'someSlot'); // append into a named sub-element

group.remove(btn); // detach a single child
group.clear(); // destruct and drop all children

group.elements; // direct children (may include nested groups/arrays)
group.allChildren; // flattened list of every leaf element
```

## State broadcast

```js
// Apply a size to the group and all buttons inside it:
group.buttonSize = 'large'; // triggers update() -> propagates to children

// Mirror every modifier set on the group onto its children:
group.syncMod = true;
group.setMod('disabled', true); // now every child also gets the 'disabled' mod
```

`update()` refreshes all children and applies the current `buttonSize`; destructing the
group clears (and destructs) its children automatically.
