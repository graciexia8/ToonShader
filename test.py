Max = -1
Min = -1
def binarySearch(arr, l, r, target):
    global Max
    global Min

    if len(arr) == 1:
        if arr[0] == target:
            Max = 0
            Min = 0
        return

    if l <= r:
        midpoint = int((l + r)/2)
        print(midpoint)
        if arr[midpoint] == target:
            if Max < midpoint or Max == -1:
                Max = midpoint
            if Min > midpoint or Min == -1:
                Min = midpoint
        if arr[midpoint] <= target:
            binarySearch(arr, midpoint + 1, r, target)
        if arr[midpoint] >= target:
            binarySearch(arr, l, midpoint - 1, target)
    else:
        return
            
def searchRange(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    l = 0
    r = len(nums) - 1
    binarySearch(nums, l, r, target)
    return [Min, Max]

arr = [5,2,7,7,8,]
aa = [8]
val = searchRange(arr, 8)
print(val)