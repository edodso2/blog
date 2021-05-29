@isTest()
public class TodoControllerTest {
    public static String todo1_Name = 'Sort Laundry';
    public static Todo__c todo1 = new Todo__c(Name=todo1_Name);
    public static List<Todo__c> mockTodoList = new List<Todo__c>();

    public static MockProvider mock;
    public static Injector mockInjector;
    public static TodoService mockTodoService;

    // Runs before each test
    static {
        // Create a new mock provider
        mock = new MockProvider();

        // Create a mock todo service
        mockTodoService = (TodoService) mock.createMock(TodoService.class);

        // Create a mock injector
        mockInjector = (Injector) mock.createMock(Injector.class);

        // Mock injector return value
        mock.setMock().mockReturnValue(mockInjector.instantiate('TodoService'), mockTodoService);

        // Setup the Injector to return the mock injector
        Injector.mockInjector = mockInjector;

        // Setup some test data
        mockTodoList.add(todo1);
    }
    
    @isTest()
    private static void getTodos_returnsTodoList() {
        // Mock return values
        mock.setMock().mockReturnValue(mockTodoService.getTodos(), mockTodoList);

        // Test the method
        List<Todo__c> todoList = TodoController.getTodos();

        // Assertions
        System.assertEquals(todo1_Name, todoList[0].Name);
    }
}
