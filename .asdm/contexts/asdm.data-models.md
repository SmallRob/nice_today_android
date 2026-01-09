# Nice Today App - Data Models

## User Configuration Model
```javascript
{
  "userId": "string",           // Unique identifier for the user
  "personalInfo": {             // Personal information
    "name": "string",
    "gender": "string",
    "birthDate": "ISODateString",
    "birthTime": "string",
    "location": {
      "city": "string",
      "province": "string",
      "country": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      }
    }
  },
  "preferences": {              // User preferences
    "theme": "light|dark|auto",
    "language": "string",
    "notifications": {
      "enabled": "boolean",
      "frequency": "string"
    },
    "dataSharing": "boolean"
  },
  "createdAt": "ISODateString",
  "updatedAt": "ISODateString"
}
```

## Biorhythm Model
```javascript
{
  "date": "ISODateString",      // Date for the biorhythm data
  "physical": {                 // Physical cycle
    "value": "number",          // -100 to 100 percentage
    "cycle": "number"           // Days in cycle (typically 23)
  },
  "emotional": {                // Emotional cycle
    "value": "number",          // -100 to 100 percentage
    "cycle": "number"           // Days in cycle (typically 28)
  },
  "intellectual": {             // Intellectual cycle
    "value": "number",          // -100 to 100 percentage
    "cycle": "number"           // Days in cycle (typically 33)
  },
  "intuitive": {                // Intuitive cycle
    "value": "number",          // -100 to 100 percentage
    "cycle": "number"           // Days in cycle (typically 38)
  },
  "userData": "UserDataModel"   // Reference to user data
}
```

## Horoscope/Tarot Model
```javascript
{
  "sign": "string",             // Zodiac sign or tarot card name
  "date": "ISODateString",      // Date of prediction
  "compatibility": {            // Compatibility information
    "general": "number",        // 1-10 compatibility score
    "love": "number",           // 1-10 love compatibility
    "friendship": "number",     // 1-10 friendship compatibility
    "work": "number"            // 1-10 work compatibility
  },
  "prediction": {               // Daily prediction
    "summary": "string",        // Brief summary
    "details": "string",        // Detailed description
    "color": "string",          // Lucky color
    "luckyNumber": "number",    // Lucky number
    "mood": "string"            // Suggested mood
  },
  "traits": {                   // Character traits
    "strengths": ["string"],    // Positive traits
    "weaknesses": ["string"],   // Negative traits
    "bestMatches": ["string"]   // Best compatible signs
  }
}
```

## MBTI Personality Model
```javascript
{
  "type": "string",             // MBTI type (e.g., "INTJ", "ENFP")
  "fullName": "string",         // Full name of type
  "description": "string",      // Detailed description
  "characteristics": {          // Type characteristics
    "strengths": ["string"],
    "weaknesses": ["string"],
    "careers": ["string"],      // Suitable careers
    "relationships": {          // Relationship insights
      "romantic": "string",
      "parenting": "string",
      "friendship": "string"
    }
  },
  "cognitiveFunctions": [       // Cognitive functions stack
    {
      "function": "string",     // Dominant, auxiliary, tertiary, inferior
      "description": "string"
    }
  ],
  "userScore": {                // User's test results
    "EI": "number",             // Extraversion/Introversion score
    "SN": "number",             // Sensing/Intuition score
    "TF": "number",             // Thinking/Feeling score
    "JP": "number"              // Judging/Perceiving score
  }
}
```

## Health Data Model
```javascript
{
  "userId": "string",           // Reference to user
  "date": "ISODateString",      // Date of record
  "organRhythm": {              // Organ rhythm data
    "heart": "number",          // Heart rhythm value
    "liver": "number",          // Liver rhythm value
    "kidney": "number",         // Kidney rhythm value
    "lung": "number",           // Lung rhythm value
    "stomach": "number"         // Stomach rhythm value
  },
  "biorhythm": "BiorhythmModel", // Reference to biorhythm data
  "symptoms": [                 // Health symptoms
    {
      "type": "string",         // Symptom type
      "severity": "number",     // 1-10 severity scale
      "duration": "string",     // Duration
      "notes": "string"         // Additional notes
    }
  ],
  "wellnessScore": "number"     // Overall wellness score
}
```

## Habit Tracker Model
```javascript
{
  "id": "string",               // Unique habit identifier
  "name": "string",             // Habit name
  "description": "string",      // Habit description
  "category": "string",         // Category (health, productivity, etc.)
  "startDate": "ISODateString", // When habit was started
  "targetFrequency": "number",  // Target frequency per week
  "currentStreak": "number",    // Current streak in days
  "longestStreak": "number",    // Longest streak achieved
  "completionHistory": [        // History of completions
    {
      "date": "ISODateString",
      "completed": "boolean"
    }
  ],
  "reminders": [                // Reminder settings
    {
      "time": "string",         // Time in HH:MM format
      "enabled": "boolean"
    }
  ]
}
```

## Bazi (Four Pillars) Model
```javascript
{
  "userId": "string",           // Reference to user
  "birthDateTime": {            // Birth date and time
    "datetime": "ISODateString",
    "timezone": "string",
    "location": "string"
  },
  "fourPillars": {              // Four pillars of destiny
    "year": {
      "heavenlyStem": "string",
      "earthlyBranch": "string",
      "element": "string",
      "animal": "string"
    },
    "month": {
      "heavenlyStem": "string",
      "earthlyBranch": "string",
      "element": "string",
      "animal": "string"
    },
    "day": {
      "heavenlyStem": "string",
      "earthlyBranch": "string",
      "element": "string",
      "animal": "string"
    },
    "hour": {
      "heavenlyStem": "string",
      "earthlyBranch": "string",
      "element": "string",
      "animal": "string"
    }
  },
  "fiveElements": {             // Five elements analysis
    "wood": "number",
    "fire": "number", 
    "earth": "number",
    "metal": "number",
    "water": "number"
  },
  "destinyAnalysis": {          // Destiny analysis
    "strength": "string",       // Day master strength
    "elementsBalance": "string",
    "auspiciousElements": ["string"],
    "inauspiciousElements": ["string"]
  }
}
```

## Energy Tree Model
```javascript
{
  "id": "string",               // Unique tree identifier
  "userId": "string",           // Owner of the tree
  "name": "string",             // Tree name
  "type": "string",             // Tree type (e.g., "wellness", "goal", "relationship")
  "createdAt": "ISODateString", // Creation date
  "nodes": [                    // Tree nodes
    {
      "id": "string",           // Node unique identifier
      "parentId": "string",     // Parent node ID (null for root)
      "position": {             // Position in the tree
        "x": "number",
        "y": "number"
      },
      "content": "string",      // Node content
      "energy": "number",       // Energy value
      "timestamp": "ISODateString", // When node was created
      "connections": ["string"] // IDs of connected nodes
    }
  ],
  "energyTotal": "number",      // Total energy in the tree
  "lastUpdated": "ISODateString" // Last modification date
}
```

## Data Relationships
- **User** 1 -> * **User Config**: Users have one configuration
- **User** 1 -> * **Biorhythm**: Users have many biorhythm records
- **User** 1 -> * **Horoscope**: Users have many horoscope predictions
- **User** 1 -> * **Health Data**: Users have many health records
- **User** 1 -> * **Habits**: Users have many habits
- **User** 1 -> * **Bazi**: Users have one Bazi chart
- **User** 1 -> * **Energy Trees**: Users have many energy trees

## Data Persistence
- Local storage for user preferences and temporary data
- Capacitor Filesystem plugin for file-based data storage
- IndexedDB for complex data structures
- Capacitor Preferences for simple key-value pairs