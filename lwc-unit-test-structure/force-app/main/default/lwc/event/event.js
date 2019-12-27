import { LightningElement } from 'lwc';

export default class Event extends LightningElement {
  handleButtonClick() {
    const customEvent = new CustomEvent('click');
    this.dispatchEvent(customEvent);
  }
}