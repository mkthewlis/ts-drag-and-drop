/// <reference path="components/project-list.ts" />
/// <reference path="components/project-input.ts" />

namespace App {            
    // instantiate application classes
    new ProjectInput();
    new ProjectList("active");
    new ProjectList("finished");
}


