# Type Safe Lightning Web Components (LWC)

This article will demonstrate why using types in JavaScript can be helpful and provide a method to easily declare and use types in an SFDX LWC project. Types will provide features such as intellisense and IDE errors when defined types are not followed.

> This guide assumes that you are using vscode for SFDX LWC development as recommended by SalesForce.

We will be using JSDOC to add types to one of the examples in the lwc-recipes repository. 

> If you have not yet seen the lwc-recipes repository then you should take note of it as it provides many helpful examples.

1. `git clone https://github.com/trailheadapps/lwc-recipes.git`
2. open up the lwc-recipes project in vscode
3. now navigate to `force-app/main/default/lwc/`

There are lots of examples in this folder but we will be focusing on only one, the `todoList` example. This example is a simple todo list with the ability to sort todos by priority.

Lets take a look at how we would go about adding the todo list to a page and how type safe JavaScript can drastically improve our experience.

First, if we take a look at the todoList code we can see that there is a public api property that excepts a list of todos for the component to display

```JavaScript
@api
get todos() {
    return this._todos;
}
set todos(value) {
    this._todos = value;
    this.filterTodos();
}
```

Lets create a parent component to render the todo list with some todos. Use the vscode SFDX plugin or the command line to generate a new lwc component called todoApp. The html of the TodoApp component will simply render the todo list and pass it some todos via its public api property.

```HTML
<template>
  <c-todo-list todos={todos}></c-todo-list>
</template>
```

Now we need to define the todos array in the TodoApp component. But we do not know the structure of the todos array because JavaScript is dynamically typed! Lets go to the TodoList and define some types to make things easier for us and future developers who may want to use the TodoList component.

We will make use of JSDoc comments to define our types since vscode will recognize JSDoc comments by default. At the top of the TodoList components JavaScript file lets define the Todo type.

```JavaScript
/**
 * A todo item
 * @typedef Todo
 * @property {number} id
 * @property {string} description
 * @property {boolean} priority
 */
```

Now we can use this type on our public api property.

```JavaScript
/** @type {Todo[]} */
@api
get todos() {
  return this._todos;
}
set todos(value) {
  this._todos = value;
  this.filterTodos();
}
```

Now one last step to get our type system working! In the jsconfig.json file in the lwc folder add the "checkJs" key and set it to true. The updated file should look something like this:

```JSON
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "target": "es2015",
    "baseUrl": ".",
    "paths": {
      "c/todoList": [
        "todoList/todoList.js"
      ],
      "c/todoApp": [
        "todoApp/todoApp.js"
      ]
    },
    "checkJs": true
  },
  "include": [
    "**/*",
    "../../../../.sfdx/typings/lwc/**/*.d.ts"
  ],
  "typeAcquisition": {
    "include": [
      "jest"
    ]
  }
}
```

If we go back to the TodoApp component JavaScript we can define our todos array using the Todo type:

```JavaScript
/**
 * @type {import('c/todoList').Todo[]}
 */
get todos() {
  return [
    {
      id: 1,
      description: 'test',
      priority: false
    }
  ];
}
```

You should notice that when you type intellisense will now use the Todo type to help:

![image](https://user-images.githubusercontent.com/12009947/70873858-99354680-1f7d-11ea-9d2c-0348f77a6947.png)

vscode will also provide errors if you do not conform to the defined types:

![image](https://user-images.githubusercontent.com/12009947/70873950-f0d3b200-1f7d-11ea-8ca7-4957bfa490dc.png)

Check out some more JSDOC tricks here: https://devhints.io/jsdoc. And enjoy adding some type safety to your LWC components!