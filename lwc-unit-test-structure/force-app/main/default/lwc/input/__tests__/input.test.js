import { createElement } from 'lwc';
import { TestUtils, Simulate } from '@tigerface/lwc-test-utils';
import Input from 'c/input';

const CHANGED_VALUE = 'test';

function setupTest() {
  // Create initial element
  const element = createElement('c-input', {
    is: Input
  });
  document.body.appendChild(element);

  // Get child elements for validation
  const inputEl = element.shadowRoot.querySelector('lightning-input');
  const valueEl = element.shadowRoot.querySelector('.value');

  return { element, inputEl, valueEl };
}

describe('c-input', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('updates value when input value is changed', async () => {
    const { inputEl, valueEl } = setupTest();

    Simulate.inputChange(inputEl, CHANGED_VALUE);

    await TestUtils.flushPromises();

    expect(valueEl.textContent).toBe(CHANGED_VALUE);
  });

  // Cluttered test without Simulate or async/await for reference
  // it('updates value when input value is changed', () => {
  //   const CHANGED_VALUE = 'test';

  //   // Create initial element
  //   const element = createElement('c-input', {
  //     is: Input
  //   });
  //   document.body.appendChild(element);

  //   // Simulate input value change
  //   const inputEl = element.shadowRoot.querySelector('lightning-input');
  //   inputEl.value = CHANGED_VALUE;
  //   inputEl.dispatchEvent(new CustomEvent('change'));

  //   // Return a promise to wait for any asynchronous DOM updates. Jest
  //   // will automatically wait for the Promise chain to complete before
  //   // ending the test and fail the test if the promise rejects.
  //   return Promise.resolve().then(() => {
  //     // Select elements for validation
  //     const valueEl = element.shadowRoot.querySelector('.value');
  //     expect(valueEl.textContent).toBe(CHANGED_VALUE);
  //   });
  // });

});