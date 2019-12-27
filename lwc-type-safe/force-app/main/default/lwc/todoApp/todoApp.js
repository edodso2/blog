import { LightningElement } from 'lwc';

export default class TodoApp extends LightningElement {
  /**
   * @type {import('c/todoList').Todo[]}
   */
  get todos() {
    return [
      {
        id: 1,
        description: 'test',
        priority: false
      },
      {
        id: 3,
        description: 'test 2',
        priority: true
      }
    ];
  }
}