# Creature version 0.0.4 - README for developers

## Complex data types:
### **physicalContainerType**: The basic physical element state container

The purpose of physicalContainerType is to hold a physicalType as well as the rule last applied to that physicalType. This makes tracking rulebook activity easy. See **physicalType**.

Description:

    physicalContainerType: {
        lastRule: rulebook node last applied to this physical element
        physicalElem: type physicalType
    }

### **physicalType**: The basic type for physical objects that act in the world

Example: creatures, rocks, whatever

All physicalType objects have one thing in common: a property called **act** with a function value implementing the physicalType's action. This function takes a physicalType as an argument and **always** returns a **physicalContainerType**.

Description:

    physicalType: {
        ...
        act: functionImplementingMyAction giving physicalContainerType
    }

Where functionImplementingMyAction = f(**physicalType**) and **always** returns a **physicalContainerType**.

### **creatureType**: A type common to all creatures

Example: creatures

All creatureType objects have two things in common: 

* a property called **act**: see **physicalType**. In this sense, **creatureType** is a specialty of **physicalType**.
* a property called **conds**, which contains a string property **behavior** and a list of numerical conditions (if applicable)
    * Example behavior: 'eating'
    * Example numerical condition: glucose_level

Description: 

    creatureType: {
        ...
        act: functionImplementingMyAction functionImplementingMyAction giving physicalContainerType
        conds: {
            behavior: string
            num_cond_if_applicable: number
            ...
        }
    }