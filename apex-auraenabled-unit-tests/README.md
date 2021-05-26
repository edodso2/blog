---
path: "apex-aura-enabled-unit-tests"
title: "Proper Unit Tests for @AuraEnabled Methods"
description: "A pattern for writing proper unit tests for @AuraEnabled methods."
date: "May 26, 2021"
category: "Apex"
---

# Proper Unit Tests for @AuraEnabled Methods

True unit testing in Apex!

It is very common to write integration tests when striving for code coverage in Apex. Take the below example of a simple Todo List app:

![Image of Todo app architecture](./images/todo_list_app.png)

This app has an LWC component that shows a todo list to the user. The LWC component calls the `TodoController` to get a list of todos. The `TodoController` also calls the `TodoService`. In this example the `TodoService` is responsible for all DML operations. Although the `TodoController` could certainly perform the DML operations, it is common to break up a larger app in a similar fashion so we will be doing this for our example.

> for the sake of this example we are using a custom object Todo__c. However, the standard Task object would fit this use case without any custom code.

For testing the TodoController something like the following would suffice:

```
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
```

This is a very simple and effective test. Before the test method we insert a todo into the database then we simply verify that the inserted todo is returned from our `getTodos` method call. However, previously I stated that the `TodoService` is responsible for DML operations; however, we have DML operations in the `TodoController` test!? This is because in our test `TodoController` is calling `TodoService` to get the list of todos from the database. So we are not just testing the `TodoController` but the `TodoService` as well. This means our test is essentially an integration test and not a unit test.

To write a proper unit test we need to only test the `TodoController`. This would require mocking the `TodoService`. Before we can actually mock the `TodoService` we need to decouple our code. Currently our `TodoController` looks like this:

```
public with sharing class TodoController {
    @AuraEnabled
    public static List<Todo__c> getTodos() {
        return TodoService.getTodos();
    }
}
```

And the TodoService method looks like this:

```
public with sharing class TodoService {
    public static List<Todo__c> getTodos() {
        return [SELECT Id, Name FROM Todo__c];
    }
}
```

Static methods, for various reasons, are not easy to mock. So we will update the `getTodos` method in `TodoService` so that it is not static. We will also make the `TodoService` and `getTodos` method virtual so that can override the `getTodos` method later when writing our test mock.

```
public virtual with sharing class TodoService {
    public virtual List<Todo__c> getTodos() {
        return [SELECT Id, Name FROM Todo__c];
    }
}
```

Now we need to update our `TodoController` to use the new `getTodos` instance method. However, we need to make our update in a way that allows us to mock the `TodoService` in our tests. Dependency injection (DI) is the perfect pattern to achieve this goal. [Here](https://developer.salesforce.com/blogs/2019/07/breaking-runtime-dependencies-with-dependency-injection.html) is a great article about DI in Apex. We will be using the `Injector` class from this article as a starting point for our `Injector`.

First lets create the `Injector` class

```
public virtual class Injector { 
    private static Injector injector;

    @testVisible
    private static Injector mockInjector;

    public virtual Object instantiate(String className) {
        // Load the Type corresponding to the class name
        Type t = Type.forName(className);

        // Create a new instance of the class
        // and return it as an Object
        return t.newInstance();
    }

    public static Injector getInjector() {
        if (mockInjector != null) {
            return mockInjector;
        } else if (injector == null) {
            injector = new Injector();
        }
    
        return injector;
    }
}
```

The injector above also adds a `mockInjector` static variable. This allows us to provide a mock injector in our test classes.

Now lets update our `TodoController` to use the `Injector`

```
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
}
```

Now we are using Dependency Injection to get our `TodoService` instance! Lets make one more update to our Injector class to allow us to mock the `TodoService`:

```
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
}
```
> Note the trick to instantiate a singleton for our static methods `private static final TodoController self = new TodoController();`. This is necessary since `@AuraEnabled` methods must be static. I got this pattern from a great blog post [here](https://www.jamessimone.net/blog/joys-of-apex/organizing-invocable-and-static-code/).

Now, in our tets, we can replace our `Injector` with a mock Injector that can return a mock `TodoService`. Lets update are test from earlier to mock the `Injector` and `TodoService` by adding the below code to the top of our test file and removing the `@TestSetup` method.

```
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
```

Above we have a mock `Injector` and mock `TodoService` that the injector returns. Our complete test class looks like this:

```
@isTest()
public class TodoControllerManualMockTest {
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
```

Note that we are now mocking the `TodoService` and no DML is needed in our test class for the `TodoController`!

If this seems overcomplicated or unnecessary maybe it is for some use cases. For a lot of projects integration tests are fine. But if you find yourself overwhelmed by the complexity of your tests you might want to try splitting up your code and mocking your dependencies to simplify things.

In the next blog post I will be creating a simple mocking framework to create automatically create the mocks as opposed to manually defining the mock classes in our test class. This will also alleviate the need to make the `Injector` and `TodoService` virtual classes, so stay tuned!

Questions or concerns? Feel free to open an issue in the [blog post repository](https://github.com/edodso2/blog).

Credit:

[Organizing Invocable And Static Code](https://www.jamessimone.net/blog/joys-of-apex/organizing-invocable-and-static-code/) by James Simone. Full of great patterns for working with static code. I got the idea for the singleton `TodoController` & mocking patterns from here.

[Breaking Runtime Dependencies with Dependency Injection](https://developer.salesforce.com/blogs/2019/07/breaking-runtime-dependencies-with-dependency-injection.html) by Philippe Ozil. Great article on DI in Apex. I used the injector in this article as a base for the injector I created.
