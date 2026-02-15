from abc import ABC, abstractmethod

#adaptee
class LegacyScale:

    def __init__(self, pounds: float):
        self.pounds = pounds

    def get_weight_in_pounds(self):
        return self.pounds


#target
class WeightProvider(ABC):

    @abstractmethod 
    def weight_kg():
        pass 

# Adapter
class PoundsToKGAdapter:

    CONVERTOR_CONST = 0.45

    def __init__(self, legacy: LegacyScale):
        self.legacy = legacy

    def  weight_kg(self):
        return self.CONVERTOR_CONST * self.legacy.get_weight_in_pounds()

legacy = LegacyScale(500)
adapter = PoundsToKGAdapter(legacy)
print(adapter.weight_kg())