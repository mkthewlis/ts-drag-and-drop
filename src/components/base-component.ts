    namespace App {
        // Component Base Class 
        export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
            templateElement: HTMLTemplateElement;
            // T & U used here as the html element differs depending on where Component is used
            hostElement: T;
            element: U;
        
            constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
                // access html elements in index.html file to initialise it
                this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
                this.hostElement = document.getElementById(hostElementId)! as T;
        
                // html element to be rendered to the application
                const importedNode = document.importNode(this.templateElement.content, true);
                this.element = importedNode.firstElementChild as U;
                // creates dynamic ids
                if (newElementId) {
                    this.element.id = newElementId;
                }
        
                this.attach(insertAtStart);
            }
        
            // method to attach the form element into DOM
            private attach(insertAtBeginning: boolean) {
                this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
            }
        
            abstract configure(): void;
            abstract renderContent(): void;
        }

    }