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

        if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
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
            console.log(title, desc, people);
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

// Instance of ProjectInput class
const prjInput = new ProjectInput();
