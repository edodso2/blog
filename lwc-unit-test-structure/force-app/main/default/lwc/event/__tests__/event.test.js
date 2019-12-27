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

  // Cluttered test without test setup function
  // it('dispatches click event when button is clicked', () => {
  //   const mockClickHandler = jest.fn();

  //    // Create initial element
  //    const element = createElement('c-event', {
  //      is: Event
  //    });
  //    element.addEventListener('click', mockClickHandler);
  //    document.body.appendChild(element);

  //    // Simulate button click
  //    const buttonEl = element.shadowRoot.querySelector('lightning-button');
  //    buttonEl.click();

  //    expect(mockClickHandler).toHaveBeenCalled(); 
  //  });

});