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