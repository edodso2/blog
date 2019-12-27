import { LightningElement, track } from 'lwc';

export default class Input extends LightningElement {
  @track value;

  handleInputChange(event) {
    this.value = event.target.value;
  }
}