import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
  @api label;

  handleClick() {
    const payload = {
      detail: 'Hello World!'
    };

    const customEvent = new CustomEvent('showgreeting', payload);

    this.dispatchEvent(customEvent);
  }
}