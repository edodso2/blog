public with sharing class TodoService {
    public virtual List<Todo__c> getTodos() {
        return [SELECT Id, Name FROM Todo__c];
    }

    public void addTodo(String name) {
        Todo__c todo = new Todo__c(Name = name);
        insert todo;
    }
}
