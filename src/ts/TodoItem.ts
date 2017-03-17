/**
 * Created by fmixagent on 01/03/2017.
 */
namespace TodoApp {

    export interface TodoData {
        id:number;
        todoTxt:string;
    }

    export class TodoItem {

        // DOM ELEMENTS

        private _todoData:TodoData;

        constructor (todoData:TodoData){

            // Recover data
            this._todoData = todoData;
        }

        getHTML():string {

            // Create template with todo text
            var itemHTML:string;
            itemHTML = `
            <li class="listUOC-item">
                <div href="#" class="listUOC-item-todo">${this._todoData.todoTxt}</div>
                <button data-id="${this._todoData.id}"  class="btn btUOC listUOC-item-removeBt btUOC-grey"><span class="glyphicon glyphicon-trash"></span> Remove</button>
            </li>
            `;

            return itemHTML;
        }
    }
}