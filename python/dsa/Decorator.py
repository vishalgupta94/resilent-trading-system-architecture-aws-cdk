from abc import ABC, abstractmethod


class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float:
        pass
    
    @abstractmethod
    def description(self) -> str:
        pass 

class SimpleCoffee(Coffee):
    def cost(self):
        return 1.00

    def description(self):
        return "Sample Coffee"

class CoffeeDecorator(Coffee):

    def __init__(self, coffee: Coffee):
        self.coffee = coffee

    def cost(self) -> float:
        return self.coffee.cost()
    
    def description(self) -> str:
        return self.coffee.description()
    
class ExtraCoffee(CoffeeDecorator):


    def cost(self):
        return super().cost() + 2.00

    def description(self):
        return super().description() + ", Extra Coffee"

class MoreExtraCoffee(CoffeeDecorator):

    def cost(self):
        return super().cost() + 3.00

    def description(self):
        return super().description() + ", More Extra Coffee"

sample = SimpleCoffee()
# print(sample.description())
extraCoffee = ExtraCoffee(sample)
moreExtraCoffee = MoreExtraCoffee(extraCoffee)
print(moreExtraCoffee.description())