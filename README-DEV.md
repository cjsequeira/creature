# Creature version 0.0.1 - README for developers

## Complex data types:
### **physicalType**: The basic world element type

Example: creatures

All physicalType objects have one thing in common: a property called **act** with a function value implementing the physicalType's action. This function takes a physicalType as an argument and **always** returns a physicalType.

Description:

    physicalType: {
        ...
        act: functionImplementingMyAction
    }

Where functionImplementingMyAction = f(physicalType) and **always** returns a physicalType.

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
        act: functionImplementingMyAction
        conds: {
            behavior: string
            num_cond_if_applicable: number
            ...
        }
    }