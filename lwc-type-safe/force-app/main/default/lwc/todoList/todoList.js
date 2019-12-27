import { LightningElement, api, track } from 'lwc';

/**
 * A todo item
 * @typedef Todo
 * @property {number} id
 * @property {string} description
 * @property {boolean} priority
 */

export default class TodoList extends LightningElement {
    @track filteredTodos = [];

    _todos = [];

    priorityFilter = false;

    /** @type {Todo[]} */
    @api
    get todos() {
        return this._todos;
    }
    set todos(value) {
        this._todos = value;
        this.filterTodos();
    }

    filterTodos() {
        if (this.priorityFilter) {
            this.filteredTodos = this._todos.filter(
                todo => todo.priority === true
            );
        } else {
            this.filteredTodos = this._todos;
        }
    }

    handleCheckboxChange(event) {
        this.priorityFilter = event.target.checked;
        this.filterTodos();
    }
}
