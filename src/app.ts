class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element:HTMLFormElement;

    constructor() {
        // access html elements in index.html file
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // form element to be rendered to the application
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.attach();
    }

    // inserts new element into DOM
    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

const prjInput = new ProjectInput();
