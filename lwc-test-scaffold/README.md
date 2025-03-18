---
path: "lwc-test-scaffold"
title: "Supercharge Your LWC Unit Test Workflow"
description: "Drastically increase productivity when Unit Testing Lightning Web Components (LWC)"
date: "Apr 22, 2020"
category: "LWC"
---

# Supercharge Your Unit Test Workflow

In a [previous blog post](https://tigerfacesystems.com/blog/lwc-unit-test-structure) we discussed an opinionated approach for structuring unit tests. Now an automatic test file generator is available to generate a test file following that structure called [LWC Test Scaffold](https://github.com/edodso2/lwc-test-scaffold). 

In this blog post we will quickly demonstrate how to use LWC Test Scaffold.

> If you want to follow along check out the repository for this post here: https://github.com/edodso2/blog/tree/master/lwc-test-scaffold

We will be generating a test scaffold for the todoForm component. Where a user can enter a name for there todo and submit the form. See the HTML here:

```html
<template>
  <form onSubmit={handleSubmit}>
    <lightning-input label="Todo Name:" type="text"></lightning-input>
    <c-submit-button>Submit</c-submit-button>
  </form>
</template>
```

Here is the JS:

```javascript
import { LightningElement } from 'lwc';

export default class TodoForm extends LightningElement {
  handleSubmit(e) {
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('submit')
    );
  }
}
```

To test this component we will probably need a few things:

1. a reference to the `lightning-input` & the `form` element so that we can simulate user input and form submission using our test.
2. a jest mock declaration for the `c-submit-button`
3. all the test setup code involved in creating the todo form component to run tests on

We will be generating all the code for these three steps with `LWC Test Scaffold`.

In the root of the project directory lets run this command in the terminal window:
```
npx github:edodso2/lwc-test-scaffold
```

This should kick off the CLI and you should see this prompt in your terminal window:
```bash
? What is the component class name?
```

Fill out the CLI prompts as follows:
```bash
? What is the component class name? TodoForm
? Include @tigerface/lwc-test-utils? (must already be installed via NPM) Yes
? Enter child elements needed for assertions:  lightning-input,form
? Enter the event names your component outputs that are needed for assertions:  submit
? Mock child components? Yes
```

After you complete all the prompts, if you are following along, you should see a test file generated at `force-app/main/default/lwc/todoForm/__tests__/`

Here is the file:
```javascript
import { createElement } from "lwc";
import { TestUtils, Simulate } from "@tigerface/lwc-test-utils";

import TodoForm from "c/todoForm";

jest.mock("c/submitButton");

// hide console warnings from LWC about manually
// setting value of inputs via input.value.
// eslint-disable-next-line no-console
console.warn = jest.fn();

// shared test constants
const TEST = "";

function setupTest() {
  // create element
  const element = createElement("c-todo-form", {
    is: TodoForm
  });

  // set elem props
  element.prop = TEST;

  // add elem to body
  document.body.appendChild(element);

  // get child elements for assertions
  const lightningInputEl = element.shadowRoot.querySelector("lightning-input");
  const formEl = element.shadowRoot.querySelector("form");

  // event listener mocks
  const submitEventListener = jest.fn();

  // add event listener mocks
  element.addEventListener("submit", submitEventListener);

  return {
    element,
    lightningInputEl,
    formEl,
    submitEventListener
  };
}

describe("c-todo-form", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it("", () => {});
});
```

Not bad for starting off, no time spent writing a test file from scratch!

Take note of line 24 in the test file 
```javascript
// set elem props
element.prop = TEST;
```

This is where you can set public API properties for the element. Either pass them in the setupTest function or hard code them for all the tests as a constant.

LWC Test Scaffold isn't perfect though! For example if you need to get an array of elements you can manually change the child queries to something like:
```javascript
const lightningInputEls = element.shadowRoot.querySelectorAll("lightning-input");
```

Thanks for checking out this blog post and hopefully you find LWC Test Scaffold useful, we would love to hear any feedback via github!