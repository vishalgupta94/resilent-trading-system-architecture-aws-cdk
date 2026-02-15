# https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:

        def upper_bound():
            low, high = 0, len(nums) - 1
            index = -1
            while low <= high:
                mid = (low + high) // 2

                if nums[mid] == target:
                    index = mid
                    low = mid + 1
                elif nums[mid] > target:
                    high = mid - 1
                else:
                    low = mid + 1

            return index

        def lower_bound():
            low, high = 0, len(nums) - 1
            index = -1
            while low <= high:
                mid = (low + high) // 2

                if nums[mid] == target:
                    index = mid
                    high = mid - 1
                elif nums[mid] > target:
                    high = mid - 1
                else:
                    low = mid + 1

            return index

        return [lower_bound(), upper_bound()]
