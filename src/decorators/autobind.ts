    namespace App {
        // Autobind TS decorator
        export function autobind(_: any, _2: string, descriptor: PropertyDescriptor){
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
    }