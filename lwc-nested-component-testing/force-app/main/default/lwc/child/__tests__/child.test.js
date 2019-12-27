import { createElement } from 'lwc';
import Child from 'c/child';

const LABEL = 'Show a Greeting';

describe('c-child', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('shows label based on public property', () => {
    // Create initial element
    const element = createElement('c-child', {
      is: Child
    });
    // Set public property
    element.label = LABEL;
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      // Select elements for validation
      const label = element.shadowRoot.querySelector('label');
      expect(label.textContent).toBe(LABEL);
    });
  });

  it('dispatches showgreeting event on click of button', () => {
    // Create initial element
    const element = createElement('c-child', {
      is: Child
    });
    document.body.appendChild(element);
  
    // Define a variable to store the event value
    let greetingEvent;
  
    // Listen for the event
    element.addEventListener('showgreeting', (event) => {
      greetingEvent = event
    });
  
    // Select the button element
    const button = element.shadowRoot.querySelector('button');
  
    // Click the button to dispatch the event
    button.click();
  
    return Promise.resolve().then(() => {
      // Ensure event fired correctly
      expect(greetingEvent.detail).toBe('Hello World!');
    });
  });
});
