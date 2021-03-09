# Creature version 0.0.10 - README for developers

I got new rules let's count 'em:

1. NO STATE IN ACTIONS
2. NO ACTIONS IN REDUCERS

## Complex data types:
### **physType**: The basic type for physical objects that act in the world

Example: creatures, rocks, whatever

All physType objects have one thing in common: a property called **act** with a function value implementing the physType's action. This function takes a **physType** as an argument and **always** returns a **physType**.

Description:

    physType: {
        ...
        act: functionImplementingMyAction returns physType
    }

Where functionImplementingMyAction = f(**physType**) and **always** returns a **physType**.

### **creatureType**, a specialty of **physType**: A type common to all creatures

All creatureType objects have two things in common: 

* a property called **act**: see **physType**. In this sense, **creatureType** is a specialty of **physType**.
* a property called **conds**, which contains a string property **behavior** and a list of numerical conditions (if applicable)
    * Example behavior: 'eating'
    * Example numerical condition: glucose_level

Description: 

    creatureType: {
        ...
        act: functionImplementingMyAction giving physContainerType
        conds: {
            behavior: string
            num_cond_if_applicable: number
            ...
        }
    }

### **desireFuncType**: A type for creature desire functions - TO BE ADDED

### **randGen**: The app's mutable random number generator - TO BE ADDED

### **storeType**: The application store data type - TO BE ADDED

### **journalType**: The type for the app journal - TO BE ADDED

### **actionType**: The type for Redux-like actions - TO BE ADDED
