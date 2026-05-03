import type { BabyGender } from '@baby-food/shared-types'

export interface Nhc2025SdBandPoint {
  ageMonths: number
  minus3: number
  minus2: number
  minus1: number
  median: number
  plus1: number
  plus2: number
  plus3: number
}

export const nhc2025SdTables: Record<'height' | 'weight', Record<BabyGender, Nhc2025SdBandPoint[]>> = {
  "weight": {
    "boy": [
      {
        "ageMonths": 0,
        "minus3": 2.1,
        "minus2": 2.5,
        "minus1": 2.9,
        "median": 3.3,
        "plus1": 3.9,
        "plus2": 4.4,
        "plus3": 5
      },
      {
        "ageMonths": 1,
        "minus3": 2.9,
        "minus2": 3.4,
        "minus1": 3.9,
        "median": 4.5,
        "plus1": 5.1,
        "plus2": 5.8,
        "plus3": 6.6
      },
      {
        "ageMonths": 2,
        "minus3": 3.8,
        "minus2": 4.3,
        "minus1": 4.9,
        "median": 5.6,
        "plus1": 6.3,
        "plus2": 7.1,
        "plus3": 8
      },
      {
        "ageMonths": 3,
        "minus3": 4.4,
        "minus2": 5,
        "minus1": 5.7,
        "median": 6.4,
        "plus1": 7.2,
        "plus2": 8,
        "plus3": 9
      },
      {
        "ageMonths": 4,
        "minus3": 4.9,
        "minus2": 5.6,
        "minus1": 6.2,
        "median": 7,
        "plus1": 7.8,
        "plus2": 8.7,
        "plus3": 9.7
      },
      {
        "ageMonths": 5,
        "minus3": 5.3,
        "minus2": 6,
        "minus1": 6.7,
        "median": 7.5,
        "plus1": 8.4,
        "plus2": 9.3,
        "plus3": 10.4
      },
      {
        "ageMonths": 6,
        "minus3": 5.7,
        "minus2": 6.4,
        "minus1": 7.1,
        "median": 7.9,
        "plus1": 8.8,
        "plus2": 9.8,
        "plus3": 10.9
      },
      {
        "ageMonths": 7,
        "minus3": 5.9,
        "minus2": 6.7,
        "minus1": 7.4,
        "median": 8.3,
        "plus1": 9.2,
        "plus2": 10.3,
        "plus3": 11.4
      },
      {
        "ageMonths": 8,
        "minus3": 6.2,
        "minus2": 6.9,
        "minus1": 7.7,
        "median": 8.6,
        "plus1": 9.6,
        "plus2": 10.7,
        "plus3": 11.9
      },
      {
        "ageMonths": 9,
        "minus3": 6.4,
        "minus2": 7.1,
        "minus1": 8,
        "median": 8.9,
        "plus1": 9.9,
        "plus2": 11,
        "plus3": 12.3
      },
      {
        "ageMonths": 10,
        "minus3": 6.6,
        "minus2": 7.4,
        "minus1": 8.2,
        "median": 9.2,
        "plus1": 10.2,
        "plus2": 11.4,
        "plus3": 12.7
      },
      {
        "ageMonths": 11,
        "minus3": 6.8,
        "minus2": 7.6,
        "minus1": 8.4,
        "median": 9.4,
        "plus1": 10.5,
        "plus2": 11.7,
        "plus3": 13
      },
      {
        "ageMonths": 12,
        "minus3": 6.9,
        "minus2": 7.7,
        "minus1": 8.6,
        "median": 9.6,
        "plus1": 10.8,
        "plus2": 12,
        "plus3": 13.3
      },
      {
        "ageMonths": 13,
        "minus3": 7.1,
        "minus2": 7.9,
        "minus1": 8.8,
        "median": 9.9,
        "plus1": 11,
        "plus2": 12.3,
        "plus3": 13.7
      },
      {
        "ageMonths": 14,
        "minus3": 7.2,
        "minus2": 8.1,
        "minus1": 9,
        "median": 10.1,
        "plus1": 11.3,
        "plus2": 12.6,
        "plus3": 14
      },
      {
        "ageMonths": 15,
        "minus3": 7.4,
        "minus2": 8.3,
        "minus1": 9.2,
        "median": 10.3,
        "plus1": 11.5,
        "plus2": 12.8,
        "plus3": 14.3
      },
      {
        "ageMonths": 16,
        "minus3": 7.5,
        "minus2": 8.4,
        "minus1": 9.4,
        "median": 10.5,
        "plus1": 11.7,
        "plus2": 13.1,
        "plus3": 14.6
      },
      {
        "ageMonths": 17,
        "minus3": 7.7,
        "minus2": 8.6,
        "minus1": 9.6,
        "median": 10.7,
        "plus1": 12,
        "plus2": 13.4,
        "plus3": 14.9
      },
      {
        "ageMonths": 18,
        "minus3": 7.8,
        "minus2": 8.8,
        "minus1": 9.8,
        "median": 10.9,
        "plus1": 12.2,
        "plus2": 13.7,
        "plus3": 15.3
      },
      {
        "ageMonths": 19,
        "minus3": 8,
        "minus2": 8.9,
        "minus1": 10,
        "median": 11.1,
        "plus1": 12.5,
        "plus2": 13.9,
        "plus3": 15.6
      },
      {
        "ageMonths": 20,
        "minus3": 8.1,
        "minus2": 9.1,
        "minus1": 10.1,
        "median": 11.3,
        "plus1": 12.7,
        "plus2": 14.2,
        "plus3": 15.9
      },
      {
        "ageMonths": 21,
        "minus3": 8.2,
        "minus2": 9.2,
        "minus1": 10.3,
        "median": 11.5,
        "plus1": 12.9,
        "plus2": 14.5,
        "plus3": 16.2
      },
      {
        "ageMonths": 22,
        "minus3": 8.4,
        "minus2": 9.4,
        "minus1": 10.5,
        "median": 11.8,
        "plus1": 13.2,
        "plus2": 14.7,
        "plus3": 16.5
      },
      {
        "ageMonths": 23,
        "minus3": 8.5,
        "minus2": 9.5,
        "minus1": 10.7,
        "median": 12,
        "plus1": 13.4,
        "plus2": 15,
        "plus3": 16.8
      },
      {
        "ageMonths": 24,
        "minus3": 8.6,
        "minus2": 9.7,
        "minus1": 10.8,
        "median": 12.2,
        "plus1": 13.6,
        "plus2": 15.3,
        "plus3": 17.1
      },
      {
        "ageMonths": 25,
        "minus3": 8.8,
        "minus2": 9.8,
        "minus1": 11,
        "median": 12.4,
        "plus1": 13.9,
        "plus2": 15.5,
        "plus3": 17.5
      },
      {
        "ageMonths": 26,
        "minus3": 8.9,
        "minus2": 10,
        "minus1": 11.2,
        "median": 12.5,
        "plus1": 14.1,
        "plus2": 15.8,
        "plus3": 17.8
      },
      {
        "ageMonths": 27,
        "minus3": 9,
        "minus2": 10.1,
        "minus1": 11.3,
        "median": 12.7,
        "plus1": 14.3,
        "plus2": 16.1,
        "plus3": 18.1
      },
      {
        "ageMonths": 28,
        "minus3": 9.1,
        "minus2": 10.2,
        "minus1": 11.5,
        "median": 12.9,
        "plus1": 14.5,
        "plus2": 16.3,
        "plus3": 18.4
      },
      {
        "ageMonths": 29,
        "minus3": 9.2,
        "minus2": 10.4,
        "minus1": 11.7,
        "median": 13.1,
        "plus1": 14.8,
        "plus2": 16.6,
        "plus3": 18.7
      },
      {
        "ageMonths": 30,
        "minus3": 9.4,
        "minus2": 10.5,
        "minus1": 11.8,
        "median": 13.3,
        "plus1": 15,
        "plus2": 16.9,
        "plus3": 19
      },
      {
        "ageMonths": 31,
        "minus3": 9.5,
        "minus2": 10.7,
        "minus1": 12,
        "median": 13.5,
        "plus1": 15.2,
        "plus2": 17.1,
        "plus3": 19.3
      },
      {
        "ageMonths": 32,
        "minus3": 9.6,
        "minus2": 10.8,
        "minus1": 12.1,
        "median": 13.7,
        "plus1": 15.4,
        "plus2": 17.4,
        "plus3": 19.6
      },
      {
        "ageMonths": 33,
        "minus3": 9.7,
        "minus2": 10.9,
        "minus1": 12.3,
        "median": 13.8,
        "plus1": 15.6,
        "plus2": 17.6,
        "plus3": 19.9
      },
      {
        "ageMonths": 34,
        "minus3": 9.8,
        "minus2": 11,
        "minus1": 12.4,
        "median": 14,
        "plus1": 15.8,
        "plus2": 17.8,
        "plus3": 20.2
      },
      {
        "ageMonths": 35,
        "minus3": 9.9,
        "minus2": 11.2,
        "minus1": 12.6,
        "median": 14.2,
        "plus1": 16,
        "plus2": 18.1,
        "plus3": 20.4
      },
      {
        "ageMonths": 36,
        "minus3": 10,
        "minus2": 11.3,
        "minus1": 12.7,
        "median": 14.3,
        "plus1": 16.2,
        "plus2": 18.3,
        "plus3": 20.7
      }
    ],
    "girl": [
      {
        "ageMonths": 0,
        "minus3": 2,
        "minus2": 2.4,
        "minus1": 2.8,
        "median": 3.2,
        "plus1": 3.7,
        "plus2": 4.2,
        "plus3": 4.8
      },
      {
        "ageMonths": 1,
        "minus3": 2.7,
        "minus2": 3.2,
        "minus1": 3.6,
        "median": 4.2,
        "plus1": 4.8,
        "plus2": 5.5,
        "plus3": 6.2
      },
      {
        "ageMonths": 2,
        "minus3": 3.4,
        "minus2": 3.9,
        "minus1": 4.5,
        "median": 5.1,
        "plus1": 5.8,
        "plus2": 6.6,
        "plus3": 7.5
      },
      {
        "ageMonths": 3,
        "minus3": 4,
        "minus2": 4.5,
        "minus1": 5.2,
        "median": 5.8,
        "plus1": 6.6,
        "plus2": 7.5,
        "plus3": 8.5
      },
      {
        "ageMonths": 4,
        "minus3": 4.4,
        "minus2": 5,
        "minus1": 5.7,
        "median": 6.4,
        "plus1": 7.3,
        "plus2": 8.2,
        "plus3": 9.3
      },
      {
        "ageMonths": 5,
        "minus3": 4.8,
        "minus2": 5.4,
        "minus1": 6.1,
        "median": 6.9,
        "plus1": 7.8,
        "plus2": 8.8,
        "plus3": 10
      },
      {
        "ageMonths": 6,
        "minus3": 5.1,
        "minus2": 5.7,
        "minus1": 6.5,
        "median": 7.3,
        "plus1": 8.2,
        "plus2": 9.3,
        "plus3": 10.6
      },
      {
        "ageMonths": 7,
        "minus3": 5.3,
        "minus2": 6,
        "minus1": 6.8,
        "median": 7.6,
        "plus1": 8.6,
        "plus2": 9.8,
        "plus3": 11.1
      },
      {
        "ageMonths": 8,
        "minus3": 5.6,
        "minus2": 6.3,
        "minus1": 7,
        "median": 7.9,
        "plus1": 9,
        "plus2": 10.2,
        "plus3": 11.6
      },
      {
        "ageMonths": 9,
        "minus3": 5.8,
        "minus2": 6.5,
        "minus1": 7.3,
        "median": 8.2,
        "plus1": 9.3,
        "plus2": 10.5,
        "plus3": 12
      },
      {
        "ageMonths": 10,
        "minus3": 5.9,
        "minus2": 6.7,
        "minus1": 7.5,
        "median": 8.5,
        "plus1": 9.6,
        "plus2": 10.9,
        "plus3": 12.4
      },
      {
        "ageMonths": 11,
        "minus3": 6.1,
        "minus2": 6.9,
        "minus1": 7.7,
        "median": 8.7,
        "plus1": 9.9,
        "plus2": 11.2,
        "plus3": 12.8
      },
      {
        "ageMonths": 12,
        "minus3": 6.3,
        "minus2": 7,
        "minus1": 7.9,
        "median": 8.9,
        "plus1": 10.1,
        "plus2": 11.5,
        "plus3": 13.1
      },
      {
        "ageMonths": 13,
        "minus3": 6.4,
        "minus2": 7.2,
        "minus1": 8.1,
        "median": 9.2,
        "plus1": 10.4,
        "plus2": 11.8,
        "plus3": 13.5
      },
      {
        "ageMonths": 14,
        "minus3": 6.6,
        "minus2": 7.4,
        "minus1": 8.3,
        "median": 9.4,
        "plus1": 10.6,
        "plus2": 12.1,
        "plus3": 13.8
      },
      {
        "ageMonths": 15,
        "minus3": 6.7,
        "minus2": 7.6,
        "minus1": 8.5,
        "median": 9.6,
        "plus1": 10.9,
        "plus2": 12.4,
        "plus3": 14.1
      },
      {
        "ageMonths": 16,
        "minus3": 6.9,
        "minus2": 7.7,
        "minus1": 8.7,
        "median": 9.8,
        "plus1": 11.1,
        "plus2": 12.6,
        "plus3": 14.5
      },
      {
        "ageMonths": 17,
        "minus3": 7,
        "minus2": 7.9,
        "minus1": 8.9,
        "median": 10,
        "plus1": 11.4,
        "plus2": 12.9,
        "plus3": 14.8
      },
      {
        "ageMonths": 18,
        "minus3": 7.2,
        "minus2": 8.1,
        "minus1": 9.1,
        "median": 10.2,
        "plus1": 11.6,
        "plus2": 13.2,
        "plus3": 15.1
      },
      {
        "ageMonths": 19,
        "minus3": 7.3,
        "minus2": 8.2,
        "minus1": 9.2,
        "median": 10.4,
        "plus1": 11.8,
        "plus2": 13.5,
        "plus3": 15.4
      },
      {
        "ageMonths": 20,
        "minus3": 7.5,
        "minus2": 8.4,
        "minus1": 9.4,
        "median": 10.6,
        "plus1": 12.1,
        "plus2": 13.7,
        "plus3": 15.7
      },
      {
        "ageMonths": 21,
        "minus3": 7.6,
        "minus2": 8.6,
        "minus1": 9.6,
        "median": 10.9,
        "plus1": 12.3,
        "plus2": 14,
        "plus3": 16
      },
      {
        "ageMonths": 22,
        "minus3": 7.8,
        "minus2": 8.7,
        "minus1": 9.8,
        "median": 11.1,
        "plus1": 12.5,
        "plus2": 14.3,
        "plus3": 16.4
      },
      {
        "ageMonths": 23,
        "minus3": 7.9,
        "minus2": 8.9,
        "minus1": 10,
        "median": 11.3,
        "plus1": 12.8,
        "plus2": 14.6,
        "plus3": 16.7
      },
      {
        "ageMonths": 24,
        "minus3": 8.1,
        "minus2": 9,
        "minus1": 10.2,
        "median": 11.5,
        "plus1": 13,
        "plus2": 14.8,
        "plus3": 17
      },
      {
        "ageMonths": 25,
        "minus3": 8.2,
        "minus2": 9.2,
        "minus1": 10.3,
        "median": 11.7,
        "plus1": 13.3,
        "plus2": 15.1,
        "plus3": 17.3
      },
      {
        "ageMonths": 26,
        "minus3": 8.4,
        "minus2": 9.4,
        "minus1": 10.5,
        "median": 11.9,
        "plus1": 13.5,
        "plus2": 15.4,
        "plus3": 17.7
      },
      {
        "ageMonths": 27,
        "minus3": 8.5,
        "minus2": 9.5,
        "minus1": 10.7,
        "median": 12.1,
        "plus1": 13.7,
        "plus2": 15.7,
        "plus3": 18
      },
      {
        "ageMonths": 28,
        "minus3": 8.6,
        "minus2": 9.7,
        "minus1": 10.9,
        "median": 12.3,
        "plus1": 14,
        "plus2": 16,
        "plus3": 18.3
      },
      {
        "ageMonths": 29,
        "minus3": 8.8,
        "minus2": 9.8,
        "minus1": 11.1,
        "median": 12.5,
        "plus1": 14.2,
        "plus2": 16.2,
        "plus3": 18.7
      },
      {
        "ageMonths": 30,
        "minus3": 8.9,
        "minus2": 10,
        "minus1": 11.2,
        "median": 12.7,
        "plus1": 14.4,
        "plus2": 16.5,
        "plus3": 19
      },
      {
        "ageMonths": 31,
        "minus3": 9,
        "minus2": 10.1,
        "minus1": 11.4,
        "median": 12.9,
        "plus1": 14.7,
        "plus2": 16.8,
        "plus3": 19.3
      },
      {
        "ageMonths": 32,
        "minus3": 9.1,
        "minus2": 10.3,
        "minus1": 11.6,
        "median": 13.1,
        "plus1": 14.9,
        "plus2": 17.1,
        "plus3": 19.6
      },
      {
        "ageMonths": 33,
        "minus3": 9.3,
        "minus2": 10.4,
        "minus1": 11.7,
        "median": 13.3,
        "plus1": 15.1,
        "plus2": 17.3,
        "plus3": 20
      },
      {
        "ageMonths": 34,
        "minus3": 9.4,
        "minus2": 10.5,
        "minus1": 11.9,
        "median": 13.5,
        "plus1": 15.4,
        "plus2": 17.6,
        "plus3": 20.3
      },
      {
        "ageMonths": 35,
        "minus3": 9.5,
        "minus2": 10.7,
        "minus1": 12,
        "median": 13.7,
        "plus1": 15.6,
        "plus2": 17.9,
        "plus3": 20.6
      },
      {
        "ageMonths": 36,
        "minus3": 9.6,
        "minus2": 10.8,
        "minus1": 12.2,
        "median": 13.9,
        "plus1": 15.8,
        "plus2": 18.1,
        "plus3": 20.9
      }
    ]
  },
  "height": {
    "boy": [
      {
        "ageMonths": 0,
        "minus3": 44.2,
        "minus2": 46.1,
        "minus1": 48,
        "median": 49.9,
        "plus1": 51.8,
        "plus2": 53.7,
        "plus3": 55.6
      },
      {
        "ageMonths": 1,
        "minus3": 48.9,
        "minus2": 50.8,
        "minus1": 52.8,
        "median": 54.7,
        "plus1": 56.7,
        "plus2": 58.6,
        "plus3": 60.6
      },
      {
        "ageMonths": 2,
        "minus3": 52.4,
        "minus2": 54.4,
        "minus1": 56.4,
        "median": 58.4,
        "plus1": 60.4,
        "plus2": 62.4,
        "plus3": 64.4
      },
      {
        "ageMonths": 3,
        "minus3": 55.3,
        "minus2": 57.3,
        "minus1": 59.4,
        "median": 61.4,
        "plus1": 63.5,
        "plus2": 65.5,
        "plus3": 67.6
      },
      {
        "ageMonths": 4,
        "minus3": 57.6,
        "minus2": 59.7,
        "minus1": 61.8,
        "median": 63.9,
        "plus1": 66,
        "plus2": 68,
        "plus3": 70.1
      },
      {
        "ageMonths": 5,
        "minus3": 59.6,
        "minus2": 61.7,
        "minus1": 63.8,
        "median": 65.9,
        "plus1": 68,
        "plus2": 70.1,
        "plus3": 72.2
      },
      {
        "ageMonths": 6,
        "minus3": 61.2,
        "minus2": 63.3,
        "minus1": 65.5,
        "median": 67.6,
        "plus1": 69.8,
        "plus2": 71.9,
        "plus3": 74
      },
      {
        "ageMonths": 7,
        "minus3": 62.7,
        "minus2": 64.8,
        "minus1": 67,
        "median": 69.2,
        "plus1": 71.3,
        "plus2": 73.5,
        "plus3": 75.7
      },
      {
        "ageMonths": 8,
        "minus3": 64,
        "minus2": 66.2,
        "minus1": 68.4,
        "median": 70.6,
        "plus1": 72.8,
        "plus2": 75,
        "plus3": 77.2
      },
      {
        "ageMonths": 9,
        "minus3": 65.2,
        "minus2": 67.5,
        "minus1": 69.7,
        "median": 72,
        "plus1": 74.2,
        "plus2": 76.5,
        "plus3": 78.7
      },
      {
        "ageMonths": 10,
        "minus3": 66.4,
        "minus2": 68.7,
        "minus1": 71,
        "median": 73.3,
        "plus1": 75.6,
        "plus2": 77.9,
        "plus3": 80.1
      },
      {
        "ageMonths": 11,
        "minus3": 67.6,
        "minus2": 69.9,
        "minus1": 72.2,
        "median": 74.5,
        "plus1": 76.9,
        "plus2": 79.2,
        "plus3": 81.5
      },
      {
        "ageMonths": 12,
        "minus3": 68.6,
        "minus2": 71,
        "minus1": 73.4,
        "median": 75.7,
        "plus1": 78.1,
        "plus2": 80.5,
        "plus3": 82.9
      },
      {
        "ageMonths": 13,
        "minus3": 69.6,
        "minus2": 72.1,
        "minus1": 74.5,
        "median": 76.9,
        "plus1": 79.3,
        "plus2": 81.8,
        "plus3": 84.2
      },
      {
        "ageMonths": 14,
        "minus3": 70.6,
        "minus2": 73.1,
        "minus1": 75.6,
        "median": 78,
        "plus1": 80.5,
        "plus2": 83,
        "plus3": 85.5
      },
      {
        "ageMonths": 15,
        "minus3": 71.6,
        "minus2": 74.1,
        "minus1": 76.6,
        "median": 79.1,
        "plus1": 81.7,
        "plus2": 84.2,
        "plus3": 86.7
      },
      {
        "ageMonths": 16,
        "minus3": 72.5,
        "minus2": 75,
        "minus1": 77.6,
        "median": 80.2,
        "plus1": 82.8,
        "plus2": 85.4,
        "plus3": 88
      },
      {
        "ageMonths": 17,
        "minus3": 73.3,
        "minus2": 76,
        "minus1": 78.6,
        "median": 81.2,
        "plus1": 83.9,
        "plus2": 86.5,
        "plus3": 89.2
      },
      {
        "ageMonths": 18,
        "minus3": 74.2,
        "minus2": 76.9,
        "minus1": 79.6,
        "median": 82.3,
        "plus1": 85,
        "plus2": 87.7,
        "plus3": 90.4
      },
      {
        "ageMonths": 19,
        "minus3": 75,
        "minus2": 77.7,
        "minus1": 80.5,
        "median": 83.2,
        "plus1": 86,
        "plus2": 88.8,
        "plus3": 91.5
      },
      {
        "ageMonths": 20,
        "minus3": 75.8,
        "minus2": 78.6,
        "minus1": 81.4,
        "median": 84.2,
        "plus1": 87,
        "plus2": 89.8,
        "plus3": 92.6
      },
      {
        "ageMonths": 21,
        "minus3": 76.5,
        "minus2": 79.4,
        "minus1": 82.3,
        "median": 85.1,
        "plus1": 88,
        "plus2": 90.9,
        "plus3": 93.8
      },
      {
        "ageMonths": 22,
        "minus3": 77.2,
        "minus2": 80.2,
        "minus1": 83.1,
        "median": 86,
        "plus1": 89,
        "plus2": 91.9,
        "plus3": 94.9
      },
      {
        "ageMonths": 23,
        "minus3": 78,
        "minus2": 81,
        "minus1": 83.9,
        "median": 86.9,
        "plus1": 89.9,
        "plus2": 92.9,
        "plus3": 95.9
      },
      {
        "ageMonths": 24,
        "minus3": 78,
        "minus2": 81,
        "minus1": 84.1,
        "median": 87.1,
        "plus1": 90.2,
        "plus2": 93.2,
        "plus3": 96.3
      },
      {
        "ageMonths": 25,
        "minus3": 78.6,
        "minus2": 81.7,
        "minus1": 84.9,
        "median": 88,
        "plus1": 91.1,
        "plus2": 94.2,
        "plus3": 97.3
      },
      {
        "ageMonths": 26,
        "minus3": 79.3,
        "minus2": 82.5,
        "minus1": 85.6,
        "median": 88.8,
        "plus1": 92,
        "plus2": 95.2,
        "plus3": 98.3
      },
      {
        "ageMonths": 27,
        "minus3": 79.9,
        "minus2": 83.1,
        "minus1": 86.4,
        "median": 89.6,
        "plus1": 92.9,
        "plus2": 96.1,
        "plus3": 99.3
      },
      {
        "ageMonths": 28,
        "minus3": 80.5,
        "minus2": 83.8,
        "minus1": 87.1,
        "median": 90.4,
        "plus1": 93.7,
        "plus2": 97,
        "plus3": 100.3
      },
      {
        "ageMonths": 29,
        "minus3": 81.1,
        "minus2": 84.5,
        "minus1": 87.8,
        "median": 91.2,
        "plus1": 94.5,
        "plus2": 97.9,
        "plus3": 101.2
      },
      {
        "ageMonths": 30,
        "minus3": 81.7,
        "minus2": 85.1,
        "minus1": 88.5,
        "median": 91.9,
        "plus1": 95.3,
        "plus2": 98.7,
        "plus3": 102.1
      },
      {
        "ageMonths": 31,
        "minus3": 82.3,
        "minus2": 85.7,
        "minus1": 89.2,
        "median": 92.7,
        "plus1": 96.1,
        "plus2": 99.6,
        "plus3": 103
      },
      {
        "ageMonths": 32,
        "minus3": 82.8,
        "minus2": 86.4,
        "minus1": 89.9,
        "median": 93.4,
        "plus1": 96.9,
        "plus2": 100.4,
        "plus3": 103.9
      },
      {
        "ageMonths": 33,
        "minus3": 83.4,
        "minus2": 86.9,
        "minus1": 90.5,
        "median": 94.1,
        "plus1": 97.6,
        "plus2": 101.2,
        "plus3": 104.8
      },
      {
        "ageMonths": 34,
        "minus3": 83.9,
        "minus2": 87.5,
        "minus1": 91.1,
        "median": 94.8,
        "plus1": 98.4,
        "plus2": 102,
        "plus3": 105.6
      },
      {
        "ageMonths": 35,
        "minus3": 84.4,
        "minus2": 88.1,
        "minus1": 91.8,
        "median": 95.4,
        "plus1": 99.1,
        "plus2": 102.7,
        "plus3": 106.4
      },
      {
        "ageMonths": 36,
        "minus3": 85,
        "minus2": 88.7,
        "minus1": 92.4,
        "median": 96.1,
        "plus1": 99.8,
        "plus2": 103.5,
        "plus3": 107.2
      }
    ],
    "girl": [
      {
        "ageMonths": 0,
        "minus3": 43.6,
        "minus2": 45.4,
        "minus1": 47.3,
        "median": 49.1,
        "plus1": 51,
        "plus2": 52.9,
        "plus3": 54.7
      },
      {
        "ageMonths": 1,
        "minus3": 47.8,
        "minus2": 49.8,
        "minus1": 51.7,
        "median": 53.7,
        "plus1": 55.6,
        "plus2": 57.6,
        "plus3": 59.5
      },
      {
        "ageMonths": 2,
        "minus3": 51,
        "minus2": 53,
        "minus1": 55,
        "median": 57.1,
        "plus1": 59.1,
        "plus2": 61.1,
        "plus3": 63.2
      },
      {
        "ageMonths": 3,
        "minus3": 53.5,
        "minus2": 55.6,
        "minus1": 57.7,
        "median": 59.8,
        "plus1": 61.9,
        "plus2": 64,
        "plus3": 66.1
      },
      {
        "ageMonths": 4,
        "minus3": 55.6,
        "minus2": 57.8,
        "minus1": 59.9,
        "median": 62.1,
        "plus1": 64.3,
        "plus2": 66.4,
        "plus3": 68.6
      },
      {
        "ageMonths": 5,
        "minus3": 57.4,
        "minus2": 59.6,
        "minus1": 61.8,
        "median": 64,
        "plus1": 66.2,
        "plus2": 68.5,
        "plus3": 70.7
      },
      {
        "ageMonths": 6,
        "minus3": 58.9,
        "minus2": 61.2,
        "minus1": 63.5,
        "median": 65.7,
        "plus1": 68,
        "plus2": 70.3,
        "plus3": 72.5
      },
      {
        "ageMonths": 7,
        "minus3": 60.3,
        "minus2": 62.7,
        "minus1": 65,
        "median": 67.3,
        "plus1": 69.6,
        "plus2": 71.9,
        "plus3": 74.2
      },
      {
        "ageMonths": 8,
        "minus3": 61.7,
        "minus2": 64,
        "minus1": 66.4,
        "median": 68.7,
        "plus1": 71.1,
        "plus2": 73.5,
        "plus3": 75.8
      },
      {
        "ageMonths": 9,
        "minus3": 62.9,
        "minus2": 65.3,
        "minus1": 67.7,
        "median": 70.1,
        "plus1": 72.6,
        "plus2": 75,
        "plus3": 77.4
      },
      {
        "ageMonths": 10,
        "minus3": 64.1,
        "minus2": 66.5,
        "minus1": 69,
        "median": 71.5,
        "plus1": 73.9,
        "plus2": 76.4,
        "plus3": 78.9
      },
      {
        "ageMonths": 11,
        "minus3": 65.2,
        "minus2": 67.7,
        "minus1": 70.3,
        "median": 72.8,
        "plus1": 75.3,
        "plus2": 77.8,
        "plus3": 80.3
      },
      {
        "ageMonths": 12,
        "minus3": 66.3,
        "minus2": 68.9,
        "minus1": 71.4,
        "median": 74,
        "plus1": 76.6,
        "plus2": 79.2,
        "plus3": 81.7
      },
      {
        "ageMonths": 13,
        "minus3": 67.3,
        "minus2": 70,
        "minus1": 72.6,
        "median": 75.2,
        "plus1": 77.8,
        "plus2": 80.5,
        "plus3": 83.1
      },
      {
        "ageMonths": 14,
        "minus3": 68.3,
        "minus2": 71,
        "minus1": 73.7,
        "median": 76.4,
        "plus1": 79.1,
        "plus2": 81.7,
        "plus3": 84.4
      },
      {
        "ageMonths": 15,
        "minus3": 69.3,
        "minus2": 72,
        "minus1": 74.8,
        "median": 77.5,
        "plus1": 80.2,
        "plus2": 83,
        "plus3": 85.7
      },
      {
        "ageMonths": 16,
        "minus3": 70.2,
        "minus2": 73,
        "minus1": 75.8,
        "median": 78.6,
        "plus1": 81.4,
        "plus2": 84.2,
        "plus3": 87
      },
      {
        "ageMonths": 17,
        "minus3": 71.1,
        "minus2": 74,
        "minus1": 76.8,
        "median": 79.7,
        "plus1": 82.5,
        "plus2": 85.4,
        "plus3": 88.2
      },
      {
        "ageMonths": 18,
        "minus3": 72,
        "minus2": 74.9,
        "minus1": 77.8,
        "median": 80.7,
        "plus1": 83.6,
        "plus2": 86.5,
        "plus3": 89.4
      },
      {
        "ageMonths": 19,
        "minus3": 72.8,
        "minus2": 75.8,
        "minus1": 78.8,
        "median": 81.7,
        "plus1": 84.7,
        "plus2": 87.6,
        "plus3": 90.6
      },
      {
        "ageMonths": 20,
        "minus3": 73.7,
        "minus2": 76.7,
        "minus1": 79.7,
        "median": 82.7,
        "plus1": 85.7,
        "plus2": 88.7,
        "plus3": 91.7
      },
      {
        "ageMonths": 21,
        "minus3": 74.5,
        "minus2": 77.5,
        "minus1": 80.6,
        "median": 83.7,
        "plus1": 86.7,
        "plus2": 89.8,
        "plus3": 92.9
      },
      {
        "ageMonths": 22,
        "minus3": 75.2,
        "minus2": 78.4,
        "minus1": 81.5,
        "median": 84.6,
        "plus1": 87.7,
        "plus2": 90.8,
        "plus3": 94
      },
      {
        "ageMonths": 23,
        "minus3": 76,
        "minus2": 79.2,
        "minus1": 82.3,
        "median": 85.5,
        "plus1": 88.7,
        "plus2": 91.9,
        "plus3": 95
      },
      {
        "ageMonths": 24,
        "minus3": 76,
        "minus2": 79.3,
        "minus1": 82.5,
        "median": 85.7,
        "plus1": 88.9,
        "plus2": 92.2,
        "plus3": 95.4
      },
      {
        "ageMonths": 25,
        "minus3": 76.8,
        "minus2": 80,
        "minus1": 83.3,
        "median": 86.6,
        "plus1": 89.9,
        "plus2": 93.1,
        "plus3": 96.4
      },
      {
        "ageMonths": 26,
        "minus3": 77.5,
        "minus2": 80.8,
        "minus1": 84.1,
        "median": 87.4,
        "plus1": 90.8,
        "plus2": 94.1,
        "plus3": 97.4
      },
      {
        "ageMonths": 27,
        "minus3": 78.1,
        "minus2": 81.5,
        "minus1": 84.9,
        "median": 88.3,
        "plus1": 91.7,
        "plus2": 95,
        "plus3": 98.4
      },
      {
        "ageMonths": 28,
        "minus3": 78.8,
        "minus2": 82.2,
        "minus1": 85.7,
        "median": 89.1,
        "plus1": 92.5,
        "plus2": 96,
        "plus3": 99.4
      },
      {
        "ageMonths": 29,
        "minus3": 79.5,
        "minus2": 82.9,
        "minus1": 86.4,
        "median": 89.9,
        "plus1": 93.4,
        "plus2": 96.9,
        "plus3": 100.3
      },
      {
        "ageMonths": 30,
        "minus3": 80.1,
        "minus2": 83.6,
        "minus1": 87.1,
        "median": 90.7,
        "plus1": 94.2,
        "plus2": 97.7,
        "plus3": 101.3
      },
      {
        "ageMonths": 31,
        "minus3": 80.7,
        "minus2": 84.3,
        "minus1": 87.9,
        "median": 91.4,
        "plus1": 95,
        "plus2": 98.6,
        "plus3": 102.2
      },
      {
        "ageMonths": 32,
        "minus3": 81.3,
        "minus2": 84.9,
        "minus1": 88.6,
        "median": 92.2,
        "plus1": 95.8,
        "plus2": 99.4,
        "plus3": 103.1
      },
      {
        "ageMonths": 33,
        "minus3": 81.9,
        "minus2": 85.6,
        "minus1": 89.3,
        "median": 92.9,
        "plus1": 96.6,
        "plus2": 100.3,
        "plus3": 103.9
      },
      {
        "ageMonths": 34,
        "minus3": 82.5,
        "minus2": 86.2,
        "minus1": 89.9,
        "median": 93.6,
        "plus1": 97.4,
        "plus2": 101.1,
        "plus3": 104.8
      },
      {
        "ageMonths": 35,
        "minus3": 83.1,
        "minus2": 86.8,
        "minus1": 90.6,
        "median": 94.4,
        "plus1": 98.1,
        "plus2": 101.9,
        "plus3": 105.6
      },
      {
        "ageMonths": 36,
        "minus3": 83.6,
        "minus2": 87.4,
        "minus1": 91.2,
        "median": 95.1,
        "plus1": 98.9,
        "plus2": 102.7,
        "plus3": 106.5
      }
    ]
  }
}
