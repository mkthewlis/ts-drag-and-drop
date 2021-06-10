import { DragTarget } from '../models/drag-drop';
import { Project, ProjectStatus } from '../models/project';
import { autobind } from '../decorators/autobind';
import { Component } from './base-component';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    // registers the listener function when list is created
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
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
    this.element.querySelector('ul')!.id = listId;
    // finds the h2 tag to add content to it
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  // method to render projects in the DOM
  private renderProjects() {
    const listElement = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    // clears list each time state changes to fix duplicate items
    listElement.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}
