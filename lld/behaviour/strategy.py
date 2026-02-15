from abc import ABC, abstractmethod

#abstract classes
class FlyBehaviour(ABC):
    @abstractmethod
    def fly(self):
        pass

class QuackBehaviour(ABC):
    @abstractmethod
    def quack(self):
        pass        



#concrete classes

class FlyWithWings(FlyBehaviour):
    def fly(self):
        return "Flying"

class FlyWithoutWings(FlyBehaviour):
    def fly(self):
        return "Not Flying"


#concrete classes

class Quack(QuackBehaviour):
    def quack(self):
        return "Quack"

class Squeak(QuackBehaviour):
    def quack(self):
        return "Squeak"        


class Duck:

    def __init__(self, flyBehaviour: FlyBehaviour,quackBehaviour: QuackBehaviour):
        self.flyBehaviour = flyBehaviour
        self.quackBehaviour = quackBehaviour

    def perform_fly(self):
        return self.flyBehaviour.fly()

    def perform_quack(self):
        return self.quackBehaviour.quack()

    def swim(self):
        return "Swim"

class FlyingDuck(Duck):
    def __init__(self):
        super().__init__(FlyWithWings(), Quack())

class RubberDuck(Duck):
    def __init__(self):
        super().__init__(FlyWithoutWings(), Squeak())        

flyingDuck = FlyingDuck()

print(flyingDuck.perform_fly())
print(flyingDuck.perform_quack())


rubberDuck = RubberDuck()

print(rubberDuck.perform_fly())
print(rubberDuck.perform_quack())