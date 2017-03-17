/**
 * Created by fmixagent on 01/03/2017.
 */
namespace TodoApp {

    export class TodoList {

        // TEMPLATE | DOM ELEMENTS
        static DOM_TODOLIST_CONTAINER: string = '#todo-list-container';
        static DOM_TODOLIST: string = '#todo-list';
        static DOM_NEWTODO_INPUT: string = '#new-todo-input';
        static DOM_SAVETODO_BT: string = '#save-todo-bt';

        // STORE RELATED
        static DOM_ALERT_FIRST_TIME: string = '#alert-first-time';
        static PERSISTENT_OBJECT_KEY: string = 'todoList';
        static PERSISTENT_OBJECT_DATA_PATH: string = 'data/defaultdata.json';
        static PERSISTENT_OBJECT_TODO_ID: string = 'id';
        static PERSISTENT_OBJECT_TODO_TXT: string = 'todoTxt';

        // JQUERY SELECTORS
        private $todoList: JQuery;
        private $saveTodoBt: JQuery;
        private $newTodoInput: JQuery;

        // APP PRIVATE VARS
        private _todoList: Array<TodoData> = [];    // List of todos
        private _idCounter: number = 0;             // For the next todo to save

        constructor(){

            // DOM ELEMENTS
            this.$todoList = $(TodoList.DOM_TODOLIST);
            this.$saveTodoBt = $(TodoList.DOM_SAVETODO_BT);
            this.$newTodoInput = $(TodoList.DOM_NEWTODO_INPUT);

            // CLICK EVENTS
            this.$todoList.on('click', '.listUOC-item-removeBt', this.deleteTodo);
            this.$saveTodoBt.on('click', this.saveNewTodo);
            // Disable form submit
            $('form').submit(function () {
                return false;
            });

            // DEFAULTS
            this.checkTodoListData();

        }

        private render() {

            console.log("//RENDER");

            // Reference to the DOM element that will contain the todo list
            let $todoListContainer: JQuery = $(TodoList.DOM_TODOLIST_CONTAINER);

            // Empty old todo list
            this.$todoList.detach();
            this.$todoList.empty();

            // Create new todo list
            for(let i:number=0;i<this._todoList.length;i++){
                var item:TodoItem = new TodoItem(this._todoList[i]);
                this.$todoList.append(item.getHTML());
            }

            // Add to DOM
            $todoListContainer.append( this.$todoList );
        }

        // Add new todo
        private saveNewTodo = ( ) => {

            console.log("//SAVE NEW TODO");

            // Recover todo data
            let todoTxt:string = this.$newTodoInput.val();

            // Update list if new todo introduced
            if(todoTxt!=""){

                // Update todo list
                var newTodo:TodoData = {
                    id: this._idCounter,
                    todoTxt: todoTxt
                };
                this.addTodo(newTodo, true);

                // Empty input field
                this.$newTodoInput.val("");

            }

        }

        // STORE DATA
        private checkTodoListData() {
            let storedData: any;
            let $alertFirstTime: JQuery;

            storedData = store.get(TodoList.PERSISTENT_OBJECT_KEY);
            $alertFirstTime = $(TodoList.DOM_ALERT_FIRST_TIME);

            if ( storedData ) {
                $alertFirstTime.remove();
                this.onLoadTodosDataSuccess( storedData );
            }
            else {
                console.log("//NO DATA");
                this.loadFirstTimeData();
            }
        };

        private loadFirstTimeData() {
            $.ajax({
                dataType: "json",
                url: TodoList.PERSISTENT_OBJECT_DATA_PATH,
                success: this.onLoadTodosDataSuccess,
                error: this.onLoadTodosDataError
            });
        }

        private onLoadTodosDataSuccess = ( data:any ) => {
            let i: number;
            let nTodos: number;
            let currentTodoData: TodoData;

            nTodos = data.length;
            for (i=0; i<nTodos; i++)
            {
                currentTodoData = data[i];
                this.addTodo( currentTodoData, false );
            }

            this.render();
        };

        private onLoadTodosDataError = () => {
            console.log('Error loading data.');
        };

        private savePersistentData() {
            let i: number;
            let nTodos: number;
            let currentTodo: TodoData;
            let savedTodo: Object;
            let todoListJSON: Object[];

            todoListJSON = [];
            nTodos = this._todoList.length;
            for (i=0; i<nTodos; i++)
            {
                currentTodo = this._todoList[i];

                savedTodo = {};
                savedTodo[TodoList.PERSISTENT_OBJECT_TODO_ID] = currentTodo.id;
                savedTodo[TodoList.PERSISTENT_OBJECT_TODO_TXT] = currentTodo.todoTxt;
                todoListJSON.push( savedTodo );
            }

            store.clear();
            store.set( TodoList.PERSISTENT_OBJECT_KEY, todoListJSON);
        };

        private addTodo ( newTodoData:TodoData, forceRender:boolean ) {

            this._todoList.push( newTodoData );
            this._idCounter++;

            this.savePersistentData();
            if (forceRender) { this.render(); }
        };

        private deleteTodo = ( e:Event ) => {

            console.log("//DELETE ITEM");

            let $target:JQuery = $(e.currentTarget);

            console.log("CLICK:"+ parseInt( $target.data('id') ));

            this.deleteTodoById ( parseInt( $target.data('id') ) );
        }

        private deleteTodoById ( id: number ) {

            console.log("TODO DELETED");

            let i:number = 0;
            let nTodos:number = this._todoList.length;

            for(i=0;i<nTodos;i++){
                if(this._todoList[i].id == id ){
                    this._todoList.splice(i,1);
                    break;
                }
            }

            this.savePersistentData();
            this.render();
        }

    }
}

let app: TodoApp.TodoList;

window.onload = () => {

    console.log("/// APP INIT");
    // Test todoItem
    app = new TodoApp.TodoList();
};
