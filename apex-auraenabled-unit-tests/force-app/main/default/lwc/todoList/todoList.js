import { LightningElement, track } from 'lwc';
import apexGetTodos from '@salesforce/apex/TodoController.getTodos';

export default class TodoList extends LightningElement {
  @track todos;

  async connectedCallback() {
    this.todos = await apexGetTodos();
  }
}