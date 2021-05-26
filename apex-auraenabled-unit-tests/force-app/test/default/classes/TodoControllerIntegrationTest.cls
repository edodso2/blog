@isTest()
public class TodoControllerIntegrationTest {
    public static String todo1_Name = 'Sort Laundry';
    public static Todo__c todo1 = new Todo__c(Name=todo1_Name);

    @TestSetup
    static void makeData() {
        insert todo1;
    }
    
    @isTest()
    private static void getTodos_returnsTodoList() {
        // Test the method
        List<Todo__c> todoList = TodoController.getTodos();

        // Get Todos from database for assertions
        List<Todo__c> todoListFromDb = [Select Id, Name From Todo__c];

        // Assertions
        System.assertEquals(todo1_Name, todoListFromDb[0].Name);
    }
}
