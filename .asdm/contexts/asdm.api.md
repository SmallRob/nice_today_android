# Nice Today App - API Definitions and Documentation

## Internal APIs

### User Configuration API
#### GET /api/user/config
- **Description**: Get user configuration
- **Response**: User configuration object
- **Sample Request**:
  ```
  GET /api/user/config
  Authorization: Bearer <token>
  ```
- **Sample Response**:
  ```json
  {
    "userId": "user123",
    "personalInfo": {
      "name": "John Doe",
      "gender": "male",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "birthTime": "08:00",
      "location": {
        "city": "Beijing",
        "province": "Beijing",
        "country": "China",
        "coordinates": {
          "latitude": 39.9042,
          "longitude": 116.4074
        }
      }
    },
    "preferences": {
      "theme": "auto",
      "language": "zh-CN",
      "notifications": {
        "enabled": true,
        "frequency": "daily"
      },
      "dataSharing": false
    }
  }
  ```

#### PUT /api/user/config
- **Description**: Update user configuration
- **Request Body**: User configuration object
- **Response**: Updated configuration object
- **Sample Request**:
  ```
  PUT /api/user/config
  Content-Type: application/json
  Authorization: Bearer <token>
  
  {
    "preferences": {
      "theme": "dark",
      "notifications": {
        "enabled": false
      }
    }
  }
  ```

### Biorhythm API
#### GET /api/biorhythm/today
- **Description**: Get today's biorhythm data
- **Response**: Biorhythm data for today
- **Sample Response**:
  ```json
  {
    "date": "2023-12-27T00:00:00.000Z",
    "physical": {
      "value": 75.2,
      "cycle": 23
    },
    "emotional": {
      "value": -12.4,
      "cycle": 28
    },
    "intellectual": {
      "value": 42.1,
      "cycle": 33
    },
    "intuitive": {
      "value": 89.7,
      "cycle": 38
    }
  }
  ```

#### GET /api/biorhythm/history
- **Description**: Get biorhythm history for a date range
- **Query Parameters**:
  - startDate: ISO date string
  - endDate: ISO date string
- **Response**: Array of biorhythm data points
- **Sample Request**:
  ```
  GET /api/biorhythm/history?startDate=2023-12-01&endDate=2023-12-31
  ```

### Horoscope API
#### GET /api/horoscope/today
- **Description**: Get today's horoscope for user's zodiac sign
- **Response**: Horoscope data
- **Sample Response**:
  ```json
  {
    "sign": "Aries",
    "date": "2023-12-27T00:00:00.000Z",
    "compatibility": {
      "general": 7,
      "love": 8,
      "friendship": 6,
      "work": 9
    },
    "prediction": {
      "summary": "A productive day awaits you...",
      "details": "Detailed horoscope information...",
      "color": "#FF0000",
      "luckyNumber": 7,
      "mood": "energetic"
    }
  }
  ```

#### GET /api/horoscope/sign/{sign}
- **Description**: Get horoscope for a specific zodiac sign
- **Path Parameter**: sign (e.g., aries, taurus, gemini)
- **Response**: Horoscope data for the specified sign

### MBTI API
#### POST /api/mbti/test
- **Description**: Submit MBTI test answers
- **Request Body**: Array of answers
- **Response**: MBTI type and detailed analysis
- **Sample Request**:
  ```
  POST /api/mbti/test
  Content-Type: application/json
  
  [
    {"questionId": "Q1", "answer": "E"},
    {"questionId": "Q2", "answer": "N"},
    ...
  ]
  ```
- **Sample Response**:
  ```json
  {
    "type": "INTJ",
    "fullName": "Architect",
    "description": "The Architect personality type...",
    "characteristics": {
      "strengths": ["Imaginative", "Strategic"],
      "weaknesses": ["Arrogant", "Impatient"],
      "careers": ["Engineer", "Scientist"]
    },
    "cognitiveFunctions": [
      {
        "function": "Dominant",
        "name": "Introverted Intuition",
        "description": "..."
      }
    ],
    "userScore": {
      "EI": 85,
      "SN": 20,
      "TF": 65,
      "JP": 45
    }
  }
  ```

### Health Data API
#### GET /api/health/today
- **Description**: Get today's health data
- **Response**: Health data for today
- **Sample Response**:
  ```json
  {
    "date": "2023-12-27T00:00:00.000Z",
    "organRhythm": {
      "heart": 78,
      "liver": 65,
      "kidney": 82,
      "lung": 71,
      "stomach": 59
    },
    "biorhythm": {
      "physical": 75.2,
      "emotional": -12.4,
      "intellectual": 42.1
    },
    "symptoms": [
      {
        "type": "headache",
        "severity": 3,
        "duration": "2 hours",
        "notes": "Mild headache in afternoon"
      }
    ],
    "wellnessScore": 78
  }
  ```

#### POST /api/health/log
- **Description**: Log health data
- **Request Body**: Health data to log
- **Sample Request**:
  ```
  POST /api/health/log
  Content-Type: application/json
  
  {
    "date": "2023-12-27T00:00:00.000Z",
    "symptoms": [
      {
        "type": "fatigue",
        "severity": 5,
        "notes": "Feeling tired after lunch"
      }
    ],
    "wellnessScore": 75
  }
  ```

### Bazi API
#### GET /api/bazi/chart
- **Description**: Get user's Bazi chart
- **Response**: Four pillars of destiny chart
- **Sample Response**:
  ```json
  {
    "fourPillars": {
      "year": {
        "heavenlyStem": "庚",
        "earthlyBranch": "午",
        "element": "Metal",
        "animal": "Horse"
      },
      "month": {
        "heavenlyStem": "甲",
        "earthlyBranch": "申",
        "element": "Wood",
        "animal": "Monkey"
      },
      "day": {
        "heavenlyStem": "丙",
        "earthlyBranch": "戌",
        "element": "Fire",
        "animal": "Dog"
      },
      "hour": {
        "heavenlyStem": "戊",
        "earthlyBranch": "子",
        "element": "Earth",
        "animal": "Rat"
      }
    },
    "fiveElements": {
      "wood": 2,
      "fire": 1,
      "earth": 2,
      "metal": 1,
      "water": 0
    },
    "destinyAnalysis": {
      "strength": "Strong Day Master",
      "elementsBalance": "Good balance",
      "auspiciousElements": ["Water", "Wood"],
      "inauspiciousElements": ["Fire", "Earth"]
    }
  }
  ```

## External APIs (Used by the app)

### Lunar Calendar API
- **Purpose**: Convert Gregorian dates to lunar dates and traditional Chinese calendar data
- **Library Used**: lunar-javascript
- **Functions**:
  - Convert solar to lunar dates
  - Get lunar month/day names
  - Calculate traditional Chinese calendar elements

### Geolocation API
- **Purpose**: Get user's location coordinates
- **Implementation**: Capacitor Geolocation plugin
- **Functions**:
  - Get current position
  - Watch position changes
  - Reverse geocoding

### File System API
- **Purpose**: Access device file system for data persistence
- **Implementation**: Capacitor Filesystem plugin
- **Functions**:
  - Read/write files
  - Directory operations
  - Data backup and restore

### Preferences API
- **Purpose**: Store key-value data persistently
- **Implementation**: Capacitor Preferences plugin
- **Functions**:
  - Set/get preferences
  - Remove preferences
  - Clear all preferences

## Error Handling
- All API responses follow the same error format:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable error message",
      "details": "Additional error details"
    }
  }
  ```

## Authentication
- Most APIs require user authentication
- Uses token-based authentication
- Tokens are stored in Capacitor Preferences
- Automatic token refresh mechanism

## Rate Limiting
- APIs implement rate limiting to prevent abuse
- Client-side throttling for frequent requests
- Retry mechanisms with exponential backoff for failed requests