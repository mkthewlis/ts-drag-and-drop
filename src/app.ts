// Project State Management class

class ProjectState {
    private listeners: any[] = [];
    private projects: any[] = [];
    private static instance: ProjectState;

    private constructor() {
    }
    
    // ensures there's only one instance of the project's current state
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    // event listener method to check whenever state changes
    addListener(listenerFn: Function) {
        // this pushes all event listeners into array to loop through them on execcution
        this.listeners.push(listenerFn);
    }

    // pushes new project to project state array above
    addProject(title: string, description: string, numOfPeople: number){
        const newProject = {
            id: Math.random().toString(), // generates random  id
            title: title,
            description: description,
            people: numOfPeople
        };
        this.projects.push(newProject);
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

// ProjectList Class

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    // element in this case is the <section> in the index.html file
    element: HTMLElement;
    assignedProjects: any[];

    constructor(private type: "active" | "finished") {
        // access html elements in index.html file to initialise it
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;
        this.assignedProjects = [];

        // form element to be rendered to the application
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        // creates dynamic ids
        this.element.id = `${this.type}-projects`;

        // registers the listener function when list is created
        projectState.addListener((projects: any[]) => {
            // adds projects to state projects and then renders it
            this.assignedProjects = projects;
            this.renderProjects();
        });

        this.attach();
        this.renderContent();
    }

    // method to render projects in the DOM
    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title;
            listElement.appendChild(listItem);
        }
    }

    // method to fill blank spaces in index.html file
    private renderContent() {
        // creates a dynamic id for each list item
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        // finds the h2 tag to add content to it
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    // method to attach the list element into DOM
    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
}

// ProjectInput Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // access html elements in index.html file
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // form element to be rendered to the application
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;

        // calls the methods below
        this.configure();
        this.attach();
    }

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

    // method to configure the form
    private configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }


    // method to attach the form element into DOM
    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

// instantiate application classes
const prjInput = new ProjectInput();
const activePrj = new ProjectList("active");
const finishedPrj = new ProjectList("finished");
