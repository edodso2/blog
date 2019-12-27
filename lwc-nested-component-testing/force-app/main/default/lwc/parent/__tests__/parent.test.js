import { createElement } from 'lwc';
import Parent from 'c/parent';

jest.mock('c/child');

describe('c-parent', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('sets label on child via public API property', () => {
    // Create initial element
    const element = createElement('c-parent', {
      is: Parent
    });
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      // Get the child element
      const childElem = element.shadowRoot.querySelector('c-child');

      // Ensure the label is set on the child
      expect(childElem.label).toBe(Parent.ChildLabel);
    });
  });

  it('displays a greeting from the showgreeting event ', () => {
    // Create initial element
    const element = createElement('c-parent', {
      is: Parent
    });
    document.body.appendChild(element);

    // Select rendered child for length check
    const childElem = element.shadowRoot.querySelector(
      'c-child'
    );

    const eventPayload = {
      detail: 'Hello World!'
    };

    childElem.dispatchEvent(new CustomEvent('showgreeting', eventPayload));

    return Promise.resolve().then(() => {
      const greetingElem = element.shadowRoot.querySelector('.greeting');
      expect(greetingElem.textContent).toBe(eventPayload.detail);
    });
  });
});
