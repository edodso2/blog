# Nested Component Unit Testing With LWC

The purpose of unit testing is to ensure each **unit** of a software package works as designed. This makes test more readable and maintainable. However, this can easily be overlooked when testing nested components. Take the following component structure for example:

```html
<c-parent>
  {greeting}
  <c-child label={chidLabel} onshowgreeting={handleShowGreeting}></c-child>
</c-parent>
```

Note that the parent has two responsibilities:
1. to set a label for the child via the child's public API property
2. to display a greeting in its template when the child emits a "showgreeting" event

Also, note that the child has two responsibilities:
1. to display a label in its template based on its pubic API property
3. to dispatch a "showgreeting" event when a button in its template is clicked

Notice that the parent does not display the label it only sets it on the child as a public API property. Also, the parent does not know anything about the child templates button, it only listens for the "showgreeting" event.

Our unit tests should keep these responsibilities in mind and ensure that each components test only tests its corresponding responsibilities. First, lets write a test to ensure the parent is setting the the label on the child as a public API property:

The Parent class:
```JavaScript
export default class Parent extends LightningElement {
  static ChildLabel = 'Click To Show A Greeting!'

  @track greeting;
  @track childLabel = Parent.ChildLabel;

  handleShowGreeting(event) {
    this.greeting = event.detail
  }
}
```

A piece of the Parent test class:
```JavaScript
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
```

Notice that the child element is queried in order to check its public API property but, we are not accessing the child elements DOM. We are only ensuring that the passed label value was set on the child. Below is an example of the test that does not follow proper unit testing best practices:

```JavaScript
it('sets label on child via public API property', () => {
  // Create initial element
  const element = createElement('c-parent', {
    is: Parent
  });
  document.body.appendChild(element);

  return Promise.resolve().then(() => {
    // Get the child element
    const childElem = element.shadowRoot.querySelector('c-child');

    // Get the label element of the child
    const childElemLabel = childElem.shadowRoot.querySelector('label');

    // Ensure the label is set on the child
    expect(childElemLabel.textContent).toBe(Parent.ChildLabel);
  });
});
```

In this test the parent is checking if the child rendered the label. It is the child's responsibility to render the label in the DOM not the parents. Not only is this not a true unit test, but it is a bad practice because the test is not as maintainable. If the child's <label> element in its template changes to something else, for any reason, the parents test will break! 

The next responsibility of the parent is to display a greeting in its template when the child emits a "showgreeting" event. It just so happens that the child will emit this even when a button in its template is clicked; However, beware of using code like this in the parent elements test:

```JavaScript
// Get the child element button
const childElemButton = childElem.shadowRoot.querySelector('button');

// Click the child elements button to dispatch the "showgreeting" event
childElemButton.click();
```

In the example above we are breaking the rules of unit testing again! It is the child's responsibility to dispatch the "showgreeting" event when its button is clicked so the parent should not be testing that functionality. We face the same maintainability concern as before.

A better test would look like this:

```JavaScript
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

  // Set the payload of the event
  const eventPayload = {
    detail: 'Hello World!'
  };

  // Dispatch the even from the child so the parent
  // will receive it
  childElem.dispatchEvent(new CustomEvent('showgreeting', eventPayload));

  return Promise.resolve().then(() => {
    // Get the greeting element
    const greetingElem = element.shadowRoot.querySelector('.greeting');

    // Is the value of the greeting element equal to the event greeting?
    expect(greetingElem.textContent).toBe(eventPayload.detail);
  });
});
```

Although technically the child is still dispatching the event we are not testing **how** the child dispatches the event, thus this is a true unit test and no matter how much the inner child component changes it will not break this test since we are only testing the parents code here.

The child component test is much more straightforward since it has no children:

```JavaScript
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

    // Validate label is set in the DOM
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
```

All the child's responsibilities are tested here and nothing more.

And thats almost all for unit testing properly with LWC! The last item I want to cover is mocking child components.
This is the ultimate insurance that the parent does not test any of the child's functionality. In the context of this example the child has a folder structure like below:

- child
  - \_\_tests\_\_
    - child.test.js
  - child.html
  - child.js
  - child.js-meta.xml

To add a mock for the child a new \_\_mocks\_\_ folder must be created:

- child
  - \_\_mocks\_\_
    - child.js
  - \_\_tests\_\_
    - child.test.js
  - child.html
  - child.js
  - child.js-meta.xml

\_\_mocks\_\_/child.js contains the mocked element:

```JavaScript
import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
  @api label;
}
```

Now the parent test can use the mock by adding this line to the top of the file:

```JavaScript
jest.mock('c/child');
```

By using the mock the only functionality the child has is the API value. This ensures that the parent does not test any of the child's functionality! It might even speed up your tests a bit on larger projects since your are not rendering any children.

Also be sure to add `**/__mocks__/**` to your .forceignore file so the mocks do not get pushed into any of your orgs.

Thanks for reading and check out the full source code for the code mentioned in this article here:
