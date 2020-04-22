import { LightningElement } from 'lwc';

export default class TodoForm extends LightningElement {
  handleSubmit(e) {
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('submit')
    );
  }
}