public with sharing class TodoController {
    private final TodoService todoService;

    private TodoController() {
        this.todoService = (TodoService) Injector.getInjector().instantiate('TodoService');
    }

    private static final TodoController self = new TodoController();

    @AuraEnabled
    public static List<Todo__c> getTodos() {
        return self.todoService.getTodos();
    }

    @AuraEnabled
    public static void addTodo(String name) {
        self.todoService.addTodo(name);
    }
}
