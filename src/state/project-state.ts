import { Project, ProjectStatus } from '../models/project';

type Listener<T> = (items: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];

  // event listener method to check whenever state changes
  addListener(listenerFn: Listener<T>) {
    // this pushes all event listeners into array to loop through them on execcution
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
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
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  // changes status of the project from Active to Finished
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
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
export const projectState = ProjectState.getInstance();
