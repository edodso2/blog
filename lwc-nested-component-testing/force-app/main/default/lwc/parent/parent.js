import { LightningElement, track } from 'lwc';

export default class Parent extends LightningElement {
  static ChildLabel = 'Click To Show A Greeting!'

  @track greeting;
  @track childLabel = Parent.ChildLabel;

  handleShowGreeting(event) {
    this.greeting = event.detail
  }
}