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