from random import choice

class Student:

    education_platform = 'udemy'

    def __init__(self, name, age=55):
        self.name = name
        self.age = age

    def greet(self):

        _greetings = ["him, 1 {}","him, 2 {}","him, 3 {}"]
        greeting = choice(_greetings)

        return greeting.format(self.name)

s1 = Student("Vishal")
# s2 = Student()        

        

print(s1.name)

for _ in range(4):
    print(s1.greet())
