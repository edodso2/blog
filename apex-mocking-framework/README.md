---
path: "apex-mocking-framework"
title: "How to Build a Mocking Framework with Apex"
description: "An example of how to build a mocking framework with Apex."
date: "May 27, 2021"
category: "Apex"
---

# How to Build a Mocking Framework with Apex

In the previous blog post I outlined a pattern for unit testing `@AuraEnabled` apex classes.  In this article, we will improve on the unit test in the pervious article by building a mocking framework. The mocking framework will alleviate the need to define manual mocks in our test classes.

First, we will copy the `MockProvider` from the Salesforce [Build a Mocking Framework with the Stub API](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_stub_api.htm) article.

```
@isTest
public class MockProvider implements System.StubProvider {
    
    public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, 
        Type returnType, List<Type> listOfParamTypes, List<String> listOfParamNames, 
        List<Object> listOfArgs) {
        
        // The following debug statements show an example of logging 
        // the invocation of a mocked method.
       
        // You can use the method name and return type to determine which method was called.
        System.debug('Name of stubbed method: ' + stubbedMethodName);
        System.debug('Return type of stubbed method: ' + returnType.getName());
        
        // You can also use the parameter names and types to determine which method 
        // was called.
        for (integer i =0; i < listOfParamNames.size(); i++) {
            System.debug('parameter name: ' + listOfParamNames.get(i));
            System.debug('  parameter type: ' + listOfParamTypes.get(i).getName());
        }
        
        // This shows the actual parameter values passed into the stubbed method at runtime.
        System.debug('number of parameters passed into the mocked call: ' + 
            listOfArgs.size());
        System.debug('parameter(s) sent into the mocked call: ' + listOfArgs);
        
        // This is a very simple mock provider that returns a hard-coded value 
        // based on the return type of the invoked.
        if (returnType.getName() == 'String')
            return '8/8/2016';
        else 
            return null;
    }
}
```

Next, lets add a `createMock` method to the top of our `MockProvider` class. This will actually create the mock class.

```
public Object createMock(Type typeToMock) {
    // Invoke the stub API and pass it our mock provider to create a 
    // mock class of typeToMock.
    return Test.createStub(typeToMock, this);
}
```

> Note that in the previous article we had to define the `Injector` and `TodoService` as virtual. With the `createMock` method that is no longer required and we can remove the virtual keyword!

Note the hardcoded logic at the bottom of the `MockProvider`.

```
// This is a very simple mock provider that returns a hard-coded value 
// based on the return type of the invoked.
if (returnType.getName() == 'String')
    return '8/8/2016';
else 
    return null;
```

We need to provide a way to dynamically set the return type of a mock method call. We can do this in the form of a `Map`. The key will be the method call signature and the value will be the object to return.

Lets add a map to our `MockProvider` along with a constructor to initialize the map.

```
private Map<String, Object> mockReturnValues;

public MockProvider() {
    mockReturnValues = new Map<String, Object>();
}
```

Before moving forward lets define the API for setting a return value for a mock call. 

```
// Init mock provider
mock = new MockProvider();

// Create the mock service
mockTodoService = (TodoService) mock.createMock(TodoService.class);

// Define the return value for the mock service
mock.setMock().mockReturnValue(mockTodoService.getTodos(), mockTodoList);
```

The above API will suffice for creating mocks and dynamically setting mock return values.

Lets implement the `setMock` method along with a flag to determine if we are in 'setting mock value' mode. The `setMock` method is needed to tell the `MockProvider` that we are about to setup a mock return value. The `isSettingMockValue` flag is needed for our `MockProvider` to know if we are setting a mock value or if we should return a mock value.

```
Boolean isSettingMockValue;

// Start recording mock values
private void startSettingMockValue() {
    isSettingMockValue = true;
}

// Stop recording mock values
private void stopSettingMockValue() {
    isSettingMockValue = false;
}

// Should always be called before setting a mock
// return value to let the MockProvider know that
// we are setting up a mock return value
public MockProvider setMock() {
    startSettingMockValue();
    return this;
}
```

If this is confusing note our API above for setting a mock return value `mock.setMock().mockReturnValue(mockTodoService.getTodos(), mockTodoList);`:

1. `setMock` is called and the `MockProvider` is now in 'set mock value' mode using our `isSettingMockValue` flag.
2. `mockTodoService.getTodos()` is called next. 
3. `mockReturnValue` is called last.

Note that our `MockProvider.handleMethodCall` function is called *before* our `mockReturnValue` function. This gives us an opportunity to perform some logic based on if the `isSettingMockValue` is true/false. Lets add that logic now in place of the hardcoded return logic at the bottom of the `handleMethodCall` function.

```
// Serialize the method call so that we have a string
// that represents this specific method call.
String serializedMethodCall = serializeMethodCall(stubbedMethodName, listOfArgs);

// If we are setting a mock value record the serialized method call
// so we can use it in the mockReturnValue function call.
if (isSettingMockValue) {
    this.serializedMethodCall = serializedMethodCall;
    return null;
} 

// Return the mocked value if we are not setting a mock value
else {
    return mockReturnValues.get(serializedMethodCall);
}
```

We also need the `serializeMethodCall` function:

```
// Generates a string that represents the signature of a mocked method call
private String serializeMethodCall(String stubbedMethodName, List<Object> listOfArgs) {
    return stubbedMethodName + '(' + String.join(listOfArgs, ',') + ')';
}
```

Now we can save the method call and its parameters in a string format *before* `mockReturnValue` is called. This way we can use the `serializedMethodCall` as the key in our map:

```
// Define a mock return value for a function call.
// The serialized method call is recorded from the invocation
// provided as the first parameter.
public void mockReturnValue(Object returnValue, Object mockReturnValue) {
    mockReturnValues.put(this.serializedMethodCall, mockReturnValue);
    serializedMethodCall = null;
    stopSettingMockValue();
}
```

We also make sure to call `stopSettingMockValue()` so that the `MockProvider` will return our mock values for subsequent calls.

The full `MockProvider`:

```
@isTest
public class MockProvider implements System.StubProvider {
    private Map<String, Object> mockReturnValues;
    Boolean isSettingMockValue;
    String serializedMethodCall;

    public MockProvider() {
        mockReturnValues = new Map<String, Object>();
    }

    // Invoke the stub API and pass it our mock provider to create a 
    // mock class of typeToMock.
    public Object createMock(Type typeToMock) {
        return Test.createStub(typeToMock, this);
    }

    // Start recording mock values
    private void startSettingMockValue() {
        isSettingMockValue = true;
    }

    // Stop recording mock values
    private void stopSettingMockValue() {
        isSettingMockValue = false;
    }

    // Should always be called before setting a mock
    // return value to let the MockProvider know that
    // we are setting up a mock return value
    public MockProvider setMock() {
        startSettingMockValue();
        return this;
    }

    // Define a mock return value for a function call.
    // The serialized method call is recorded from the invocation
    // provided as the first parameter.
    public void mockReturnValue(Object returnValue, Object mockReturnValue) {
        mockReturnValues.put(serializedMethodCall, mockReturnValue);
        serializedMethodCall = null;
        stopSettingMockValue();
    }
    
    public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, 
        Type returnType, List<Type> listOfParamTypes, List<String> listOfParamNames, 
        List<Object> listOfArgs) {
        
        // The following debug statements show an example of logging 
        // the invocation of a mocked method.
       
        // You can use the method name and return type to determine which method was called.
        System.debug('Name of stubbed method: ' + stubbedMethodName);
        System.debug('Return type of stubbed method: ' + returnType.getName());
        
        // You can also use the parameter names and types to determine which method 
        // was called.
        for (integer i =0; i < listOfParamNames.size(); i++) {
            System.debug('parameter name: ' + listOfParamNames.get(i));
            System.debug('  parameter type: ' + listOfParamTypes.get(i).getName());
        }
        
        // This shows the actual parameter values passed into the stubbed method at runtime.
        System.debug('number of parameters passed into the mocked call: ' + 
            listOfArgs.size());
        System.debug('parameter(s) sent into the mocked call: ' + listOfArgs);
        
        // Serialize the method call so that we have a string
        // that represents this specific method call.
        String serializedMethodCall = serializeMethodCall(stubbedMethodName, listOfArgs);

        // If we are setting a mock value record the serialized method call
        // so we can use it in the mockReturnValue function call.
        if (isSettingMockValue) {
            this.serializedMethodCall = serializedMethodCall;
            return null;
        } 
        
        // Return the mocked value if we are not setting a mock value
        else {
            return mockReturnValues.get(serializedMethodCall);
        }
    }

    // Generates a string that represents the signature of a mocked method call
    private String serializeMethodCall(String stubbedMethodName, List<Object> listOfArgs) {
        return stubbedMethodName + '(' + String.join(listOfArgs, ',') + ')';
    }
}
```

We can update the `TodoController` test in the previous blog post to use the new `MockProvider` class:

```
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
```

With the `MockProvider` we can easily define mocks without creating additional private classes in our test file. We also do not need to define classes as virtual or create interfaces to allow for overrides in test mocks.

Credit:

[Apex Mocks](https://github.com/apex-enterprise-patterns/fflib-apex-mocks). The Apex mocks framework is a full mocking framework for Apex that offers many more features than described here. I used some concepts from the Apex Mocks framework for this post.