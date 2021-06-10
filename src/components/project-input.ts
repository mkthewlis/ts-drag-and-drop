/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../util/validation.ts"/>
/// <reference path="../state/project-state.ts"/>

namespace App {
  // ProjectInput Class
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super('project-input', 'app', true, 'user-input');
      this.titleInputElement = this.element.querySelector(
        '#title'
      )! as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector(
        '#description'
      )! as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector(
        '#people'
      )! as HTMLInputElement;

      this.configure();
      this.renderContent();
    }

    // method to configure the form
    configure() {
      this.element.addEventListener('submit', this.submitHandler.bind(this));
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
        required: true
      };
      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
      };
      const peopleValidatable: Validatable = {
        value: +enteredPeople, // people converted to number here with the + sign!
        required: true,
        min: 1,
        max: 5
      };

      // runs the validation
      if (
        !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ) {
        alert('Invalid input, please try again!');
        return;
      } else {
        return [enteredTitle, enteredDescription, parseFloat(enteredPeople)];
      }
    }

    // method to clear inputs after from submission
    private clearInputs() {
      this.titleInputElement.value = '';
      this.descriptionInputElement.value = '';
      this.peopleInputElement.value = '';
    }

    // method to handle form submission
    @autobind
    private submitHandler(event: Event) {
      // prevent default submission
      event.preventDefault();
      const userInput = this.gatherUserInput();
      // checks if userInput is an array (as TS tuples - defined in the gatherUserInput method - are)
      if (Array.isArray(userInput)) {
        const [title, desc, people] = userInput;
        // uses global state saved as a const above
        projectState.addProject(title, desc, people);
        this.clearInputs();
      }
    }
  }
}
