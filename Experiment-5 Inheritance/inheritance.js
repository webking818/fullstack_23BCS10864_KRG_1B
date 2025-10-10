// Base class: Person
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // Common method for all persons
  introduce() {
    return `Hi, I'm ${this.name} and I'm ${this.age} years old.`;
  }
}

// Subclass: Student extends Person
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age); // call parent constructor
    this.grade = grade;
  }

  // Method overriding
  introduce() {
    return `Hi, I'm ${this.name}, a student in grade ${this.grade}.`;
  }

  // Additional method for Student
  study() {
    return `${this.name} is studying for exams.`;
  }
}

// Subclass: Teacher extends Person
class Teacher extends Person {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  // Method overriding
  introduce() {
    return `Hello, I'm ${this.name}, and I teach ${this.subject}.`;
  }

  // Additional method for Teacher
  teach() {
    return `${this.name} is teaching ${this.subject}.`;
  }
}

// Demonstration of Polymorphism
const people = [
  new Person("Alice", 40),
  new Student("Bob", 16, "10th"),
  new Teacher("Carol", 35, "Mathematics")
];

for (let person of people) {
  console.log(person.introduce()); // Polymorphic behavior
}

// Checking instance types
console.log("\nInstance checks:");
console.log(people[0] instanceof Person);  // true
console.log(people[1] instanceof Student); // true
console.log(people[2] instanceof Teacher); // true
console.log(people[2] instanceof Person);  // true (since Teacher extends Person)
