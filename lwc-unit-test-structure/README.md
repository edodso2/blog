---
path: "/blogs/lwc-unit-test-structure"
title: "LWC Unit Test Structure"
description: "Drastically improve the readability and simplicity of LWC unit tests."
date: "Dec 18, 2019"
category: "LWC"
---

# LWC Unit Test Structure

The goal of this guide is to outline a basic structure of Jest unit test files that minimizes code clutter from things like DOM events, querySelectors, event listeners, etc.

Unit tests can be cluttered with a few things:
1. test setup code such as the host element, event listeners, child components, etc
2. triggering DOM events
3. promise resolution

Below we will take a look at each on of these issues and propose a solution. By the end of this guide our tests will be clutter free!

> Note that all the code shown in this guide is available here: https://github.com/edodso2/lwc-unit-test-structure
> it may help to reference the repository for more context on the examples below.

## Writing A Test Setup Function

As test files get more and more tests test setup code must be repeated in each test. A global function should be used for test setup so that the code does not clutter up each test.

Below is a simple test for a component that contains a single button that, when clicked, will call a component function to dispatch an event.
```JavaScript
import { createElement } from 'lwc';
import Event from 'c/event';

describe('c-event', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('dispatches click event when button is clicked', () => {
   const mockClickHandler = jest.fn();

    // Create initial element
    const element = createElement('c-event', {
      is: Event
    });
    element.addEventListener('click', mockClickHandler);
    document.body.appendChild(element);

    // Simulate button click
    const buttonEl = element.shadowRoot.querySelector('lightning-button');
    buttonEl.click();

    expect(mockClickHandler).toHaveBeenCalled(); 
  });

});
```

As you can see from the code above, this test needs to make sure that when the button is clicked our custom 'click' event is dispatched. So we need to setup a mock event listener. If more tests are added that also need the listener the listener setup can begin to clutter up our test file. Adding a test setup function can make adding tests in the future much easier and can decrease the clutter in our individual tests.

After test setup function:
```JavaScript
import { createElement } from 'lwc';
import Event from 'c/event';

function setupTest() {
  const mockClickHandler = jest.fn();

  // Create initial element
  const element = createElement('c-event', {
    is: Event
  });
  element.addEventListener('click', mockClickHandler);
  document.body.appendChild(element);

  // Get child elements
  const buttonEl = element.shadowRoot.querySelector('lightning-button');

  return { element, buttonEl, mockClickHandler };
}

describe('c-event', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('dispatches click event when button is clicked', () => {
    const { buttonEl, mockClickHandler } = setupTest();

    buttonEl.click();

    expect(mockClickHandler).toHaveBeenCalled();
  });

});
```

All of the test setup code is abstracted out of the test. This may seem unnecessary for this small test. But as this test file grows/or for larger tests having the test setup code at the global level not only decreases clutter but increases productivity.

## Using The Simulate Class

Triggering DOM events in each test can quickly clutter up our test file. Triggering a DOM event is often a multiline effort that can easily clutter up a test. The Simulate class from the [lwc-test-utils](https://github.com/edodso2/lwc-test-utils) repository can be used to trigger events in a declarative, clutter free and readable method.

Here is a test for an input element that must update a tracked value:
```JavaScript
it('updates value when input value is changed', () => {
  const { inputEl, valueEl } = setupTest();

  // Simulate input value change
  const inputEl = element.shadowRoot.querySelector('lightning-input');
  inputEl.value = CHANGED_VALUE;
  inputEl.dispatchEvent(new CustomEvent('change'));

  // Return a promise to wait for any asynchronous DOM updates. Jest
  // will automatically wait for the Promise chain to complete before
  // ending the test and fail the test if the promise rejects.
  return Promise.resolve().then(() => {
    expect(valueEl.textContent).toBe(CHANGED_VALUE);
  });
});
```

Use Simulate to 'simulate' all the DOM events:
```JavaScript
it('updates value when input value is changed', () => {
  const { inputEl, valueEl } = setupTest();

  // Simulate input value change
  Simulate.inputChange(inputEl, CHANGED_VALUE);

  // Return a promise to wait for any asynchronous DOM updates. Jest
  // will automatically wait for the Promise chain to complete before
  // ending the test and fail the test if the promise rejects.
  return Promise.resolve().then(() => {
    expect(valueEl.textContent).toBe(CHANGED_VALUE);
  });
});
```

## Async/await Instead of Promise
In LWC Jest tests it is common to wrap assertions in a promise. But this nested code can be ugly and hard to read. Its better to use a "flushPromises" function along with async/await. The flush promises function is available on the `TestUtils` object from lwc-test-utils.

Use async/await instead of Promise's in our previous example:
```JavaScript
import { TestUtils, Simulate } from '@tigerface/lwc-test-utils';

...

it('updates value when input value is changed', async () => {
  const { inputEl, valueEl } = setupTest();

  // Simulate input value change
  Simulate.inputChange(inputEl, CHANGED_VALUE);

  await TestUtils.flushPromises();

  expect(valueEl.textContent).toBe(CHANGED_VALUE);
});
```

And thats all! Now each test only contains a few lines of code and it is very easy to add more tests to the file in the future.
