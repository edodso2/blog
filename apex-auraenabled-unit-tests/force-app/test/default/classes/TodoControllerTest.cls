@isTest()
public class TodoControllerTest {
    public static String todo1_Name = 'Sort Laundry';
    public static Todo__c todo1 = new Todo__c(Name=todo1_Name);
    public static List<Todo__c> mockTodoList = new List<Todo__c>();

    // Define a mock todo service to return our
    // mock todo list instead of using DML
    private class MockTodoService extends TodoService {
        public override List<Todo__c> getTodos() {
            return mockTodoList;
        }
    }

    // Define a mock injector that returns our
    // mock todo service
    private class MockInjector extends Injector {
        public override Object instantiate(String className) {
            return new MockTodoService();
        }
    }

    // Runs before each test
    static {
        // Setup the Injector to return the mock injector
        Injector.mockInjector = new MockInjector();

        // Setup some test data
        mockTodoList.add(todo1);
    }
    
    @isTest()
    private static void getTodos_returnsTodoList() {
        // Test the method
        List<Todo__c> todoList = TodoController.getTodos();

        // Assertions
        System.assertEquals(todo1_Name, todoList[0].Name);
    }
}
