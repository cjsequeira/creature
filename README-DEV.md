# Creature version 0.1.2 - README for developers

I got new rules let's count 'em:

1. NO STATE IN ACTIONS
2. NO ACTIONS IN REDUCERS

## Complex data types:
### **physType**: The basic type for physical objects that act in the world

Example: creatures, rocks, whatever

All physType objects have two things in common: 

* a property called **act** with a function value implementing the physType's action. This function takes a **physType** as an argument and **always** returns a **physType**.
* a property called **conds**, which contains at least an **x** and a **y** coordinate representing the physType's location.

Description:

    physType: {
        ...
        act: physType => physType,
        conds: {
            x: float,
            y: float,
            ...
        }
    }

### **creatureType**, a specialty of **physType**: A type common to all creatures

All **creatureType** objects have the same properties found in **physType**, such as **act** and coordinates, plus a **behavior** string property in **conds**.

* Example behavior: 'eating'
* Example numerical condition: glucose_level

Description: 

    creatureType: {
        ...
        act: physType => physType,
        conds: {
            x: float,
            y: float,
            behavior: string,
            ...
        }
    }

### *Simple Creature*, a **creatureType** with glucose and neuro conditions

The *Simple Creature* is a **creatureType** with an **act** function of **actAsSimpleCreature** and two additional conditions:

* glucose, as float: The internal glucose level, between 0.0 and 100.0
* neuro, as float: The internal level of neurotransmitters, between 0.0 and 100.0

Description: 

    creatureType: {
        ...
        act: actAsSimpleCreature,
        conds: {
            x: float,
            y: float,
            behavior: string,
            glucose: float,
            neuro: float,
            ...
        }
    }

### **foodType**: A type for food - TO BE ADDED

### **desireFuncType**: A type for creature desire functions - TO BE ADDED

### **randGen**: The app's mutable random number generator - TO BE ADDED

### **storeType**: The application store data type - TO BE ADDED

### **journalType**: The type for the app journal - TO BE ADDED

### **actionType**: The type for Redux-like actions - TO BE ADDED

### **eventType**: The type for application-specific events - TO BE ADDED
