# DataSchema

What would happen if we took JsonSchema and tweaked three simple
things?

1. Focus on code generation instead of validation.
2. Replace one of with tagged unions.
3. Restructure schemas to use these tagged unions.

The answer is DataSchema.


## A Quick Example

```yaml
imports:

  person.yaml:
    - Person


definitions:

  RealPlace:
    type: object
    properties:
      building:
        type: string
      room:
        type: string

  VirtualPlace:
    type: string

  Contact:
    type: object
    extends:
      - Person
    properties:
      email:
        type: string

  Meeting:
    type: object
    properties:
      place:
        type: oneOf
        these:
          real:
            type: ref
            to: RealPlace
          virtual:
            type: ref
            to: VirtualPlace
      participants:
        type: array
        items:
          type: ref
          to: Contact
```

can generate the following Typescript:

```typescript
// TODO import
import { Person } from './person';

export interface RealPlace {
  building: string;
  room: string;
}

export type VirtualPlace = string;

// TODO extends
export interface Contact extends Person {
  email: string;
}

export interface Meeting {
  place: ({ type: "real" } & RealPlace) | ({ type: "virtual" } & VirtualPlace);
  participants: Contact[];
}
```


## Code Generation

Code generation is a much simpler problem than data validation. By
focusing on code generation, we can get:

- simpler implementations,
- cleaner generated code,
- better performance.

The downside is that this schema only covers a subset of what it's
possible to represent in JSON. This is only a problem if you want to
validate existing JSON data that doesn't fit into our code model.

### Imports and References

If we use a module system like most programming languages,

- it becomes easier to generate code,
- simplifies dependency management.

### Getting Rid of Logical Types

- anyOf, allOf, not

### Simple Inheritance



## First Class Tagged Unions

Tagged unions are one of the best aspects of modern type systems. Using tagged unions instead of polymorphism.

## Using Tagged Unions in Schemas
