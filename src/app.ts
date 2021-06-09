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

    // method to handle form submission
    private submitHandler(event: Event) {
        // prevent default submission
        event.preventDefault();
        console.log(this.titleInputElement.value);
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

const prjInput = new ProjectInput();
