// @ts-ignore
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
