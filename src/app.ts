/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

namespace App {    
    // Project State Management
    type Listener<T> = (items: T[]) => void;
    class State<T> {
        protected listeners: Listener<T>[] = [];
    
        // event listener method to check whenever state changes
        addListener(listenerFn: Listener<T>) {
            // this pushes all event listeners into array to loop through them on execcution
            this.listeners.push(listenerFn);
        }
    }
    
    class ProjectState extends State<Project> {
        private projects: Project[] = [];
        private static instance: ProjectState;
    
        private constructor() {
            super();
        }
        
        // ensures there's only one instance of the project's current state
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
    
        // pushes new project to project state array above
        addProject(title: string, description: string, numOfPeople: number){
            const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)
            this.projects.push(newProject);
            this.updateListeners();
        }
    
        // changes status of the project from Active to Finished
        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
    
        private updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    
    // global instance of ProjectState, now saved as a const
    const projectState = ProjectState.getInstance();
    
    // Form validation logic
    interface Validatable {
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }
    
    function validate(validatableInput: Validatable){
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null && typeof validatableInput.value === "number") {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null && typeof validatableInput.value === "number") {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }
    
    
    // Autobind TS decorator
    function autobind(_: any, _2: string, descriptor: PropertyDescriptor){
        // Stores the method we originally defined
        const originalMethod = descriptor.value;
        // Adjusted descriptor object that binds the property sent in
        const adjDescriptor: PropertyDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        };
        return adjDescriptor;
    }
    
    // Component Base Class 
    abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
    
    // ProjectItem Class
    class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        private project: Project;
    
        get peopleQuantity() {
            if (this.project.people === 1){
                return "1 person";
            } else {
                return `${this.project.people} people`;
            }
        }
    
        constructor(hostId: string, project: Project) {
            super("single-project", hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
    
        @autobind
        dragStartHandler(event: DragEvent) {
            event.dataTransfer!.setData("text/plain", this.project.id);
            event.dataTransfer!.effectAllowed = "move";
        }
    
        dragEndHandler(_: DragEvent) {
            console.log("DragEnd");
        }
    
        configure() {
            this.element.addEventListener("dragstart", this.dragStartHandler);
            this.element.addEventListener("dragend", this.dragEndHandler);
        }
    
        renderContent() {
            this.element.querySelector("h2")!.textContent = this.project.title;
            this.element.querySelector("h3")!.textContent = this.peopleQuantity + " assigned";
            this.element.querySelector("p")!.textContent = this.project.description;
        }
    }
    
    // Project List Class
    class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[];
    
        constructor(private type: "active" | "finished") {
            super("project-list", "app", false, `${type}-projects`);
            this.assignedProjects = [];
    
            this.configure();
            this.renderContent();
        }
    
        @autobind
        dragOverHandler(event: DragEvent) {
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                event.preventDefault();
                const listElement = this.element.querySelector("ul")!;
                listElement.classList.add("droppable");
            }
        }
    
        @autobind
        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData("text/plain");
            projectState.moveProject(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
        }
    
        @autobind
        dragLeaveHandler(_: DragEvent) {
            const listElement = this.element.querySelector("ul")!;
            listElement.classList.remove("droppable");
        }
    
        configure() {
            this.element.addEventListener("dragover", this.dragOverHandler);
            this.element.addEventListener("dragleave", this.dragLeaveHandler);
            this.element.addEventListener("drop", this.dropHandler);
            // registers the listener function when list is created
            projectState.addListener((projects: Project[]) => {
                const relevantProjects = projects.filter((prj) => {
                    if (this.type === "active") {
                        return prj.status === ProjectStatus.Active;
                    } else {
                        return prj.status === ProjectStatus.Finished;
                    }
                });
                // adds projects to state projects and then renders it
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
    
        // method to fill blank spaces in index.html file
        renderContent() {
            // creates a dynamic id for each list item
            const listId = `${this.type}-projects-list`;
            this.element.querySelector("ul")!.id = listId;
            // finds the h2 tag to add content to it
            this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
        }
    
        // method to render projects in the DOM
        private renderProjects() {
            const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
            // clears list each time state changes to fix duplicate items
            listElement.innerHTML = "";
            for (const prjItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
            }
        }
    }
    
    // ProjectInput Class
    class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;
    
        constructor() {
            super("project-input", "app", true, "user-input");
            this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;
    
            this.configure();
            this.renderContent();
        }
    
        // method to configure the form
        configure() {
            this.element.addEventListener("submit", this.submitHandler.bind(this));
        }
    
        renderContent() {}
    
        // method to gather and validate input data
        private gatherUserInput(): [string, string, number] | void {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
    
            // creates objects needed for validation process
            const titleValidatable: Validatable = {
                value: enteredTitle,
                required: true,
            }
            const descriptionValidatable: Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 5,
            }
            const peopleValidatable: Validatable = {
                value: +enteredPeople, // people converted to number here with the + sign!
                required: true,
                min: 1,
                max: 5,
            }
    
            // runs the validation
            if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
                alert("Invalid input, please try again!");
                return;
            } else {
                return [enteredTitle, enteredDescription, parseFloat(enteredPeople)];
            }
        }
    
        // method to clear inputs after from submission
        private clearInputs() {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInputElement.value = "";
        }
    
        // method to handle form submission
        @autobind
        private submitHandler(event: Event) {
            // prevent default submission
            event.preventDefault();
            const userInput = this.gatherUserInput();
            // checks if userInput is an array (as TS tuples - defined in the gatherUserInput method - are)
            if (Array.isArray(userInput)){
                const [title, desc, people] = userInput;
                // uses global state saved as a const above
                projectState.addProject(title, desc, people);
                this.clearInputs();
            }
        }
    }
    // instantiate application classes
    new ProjectInput();
    new ProjectList("active");
    new ProjectList("finished");
}


