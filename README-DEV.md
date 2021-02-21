# Creature version 0.0.7 - README for developers

## Complex data types:
### **physContainerType**: The basic physical element state container

The purpose of physContainerType is to hold a physType as well as the rule last applied to that physType. This makes tracking rulebook activity easy. See **physType**.

Description:

    physContainerType: {
        lastRule: rulebook node last applied to this physical element
        physType: type physType
    }

### **physType**: The basic type for physical objects that act in the world

Example: creatures, rocks, whatever

All physType objects have one thing in common: a property called **act** with a function value implementing the physType's action. This function takes a **physContainerType** as an argument and **always** returns a **physContainerType**.

Description:

    physType: {
        ...
        act: functionImplementingMyAction giving physContainerType
    }

Where functionImplementingMyAction = f(**physContainerType**) and **always** returns a **physContainerType**.

### **creatureType**: A type common to all creatures

Example: creatures

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
