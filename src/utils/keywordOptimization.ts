// Advanced keyword optimization utilities for Phase 2 SEO implementation

// Comprehensive keyword database for water sports industry in India
export const keywordDatabase = {
  // Primary activity keywords
  activities: {
    surfing: [
      "surfing lessons India", "learn to surf India", "surf schools India", "surfing spots India",
      "surf lessons Goa", "surfing lessons Kerala", "surf camps India", "beginner surfing India",
      "professional surf coaching", "surf instructor certification", "wave riding lessons"
    ],
    sup: [
      "SUP lessons India", "stand up paddleboard India", "paddleboard rental India", "SUP yoga India",
      "SUP tours India", "stand up paddleboarding lessons", "SUP schools India", "SUP equipment rental",
      "SUP instructor training", "paddleboard lessons Goa", "SUP fitness classes"
    ],
    kitesurfing: [
      "kitesurfing lessons India", "kite surfing schools India", "kiteboarding India", "kite lessons India",
      "kitesurfing Goa", "kitesurfing Chennai", "kite surfing equipment", "kiteboarding lessons",
      "IKO certified instructors", "kitesurfing courses India", "learn kitesurfing India"
    ],
    windsurfing: [
      "windsurfing lessons India", "windsurf schools India", "windsurfing equipment rental",
      "windsurf lessons Goa", "windsurfing coaching", "windsurf camps India", "learn windsurfing"
    ]
  },

  // Location-based keywords
  locations: {
    goa: [
      "water sports Goa", "surfing Goa", "beach activities Goa", "surf schools Goa",
      "Arambol surfing", "Ashwem beach activities", "Morjim water sports", "Baga beach sports",
      "Calangute water activities", "Anjuna surfing", "Candolim beach sports"
    ],
    kerala: [
      "water sports Kerala", "surfing Kerala", "Varkala surfing", "Kovalam water sports",
      "Kerala beach activities", "surf lessons Kerala", "backwater activities Kerala",
      "Alleppey water sports", "Kochi beach activities", "Marari beach sports"
    ],
    tamilnadu: [
      "water sports Tamil Nadu", "surfing Tamil Nadu", "Mahabalipuram surfing", "Chennai beach activities",
      "Covelong surfing", "Pondicherry water sports", "Kanyakumari beach activities",
      "Marina beach sports", "ECR water activities", "surf lessons Chennai"
    ],
    karnataka: [
      "water sports Karnataka", "surfing Karnataka", "Mangalore beach activities", "Udupi water sports",
      "Mulki beach surfing", "Gokarna water activities", "Karwar beach sports", "surf lessons Bangalore"
    ],
    maharashtra: [
      "water sports Maharashtra", "surfing Maharashtra", "Mumbai beach activities", "Alibaug water sports",
      "Konkan coast activities", "Kashid beach sports", "Tarkarli water activities", "surf lessons Mumbai"
    ]
  },

  // Condition and safety keywords
  conditions: [
    "surf conditions India", "wave forecast India", "beach weather India", "surf report India",
    "wave height India", "wind conditions beaches", "tide times India", "ocean temperature India",
    "swell forecast India", "beach safety India", "surf warnings India", "water conditions India"
  ],

  // Booking and business keywords
  booking: [
    "book water sports India", "online booking water sports", "water sports reservations",
    "surf lesson booking", "water sports packages", "group bookings water sports",
    "water sports gift vouchers", "instant booking water sports", "water sports deals India"
  ],

  // Equipment and gear keywords
  equipment: [
    "water sports equipment rental", "surfboard rental India", "SUP board rental",
    "kitesurfing equipment hire", "wetsuit rental India", "water sports gear",
    "surf equipment shops India", "water sports accessories", "safety gear water sports"
  ],

  // Experience and skill level keywords
  experience: [
    "beginner water sports India", "advanced surfing lessons", "water sports for families",
    "kids water sports lessons", "women only water sports", "corporate water sports events",
    "water sports retreats India", "professional water sports training", "water sports certification"
  ]
};

// Generate targeted keyword combinations
export const generateKeywordCombinations = (
  primaryActivity: string,
  location?: string,
  skillLevel?: string,
  context?: 'booking' | 'conditions' | 'equipment' | 'learning'
): string[] => {
  const combinations: string[] = [];
  
  // Base activity keywords
  const activityKeys = keywordDatabase.activities[primaryActivity as keyof typeof keywordDatabase.activities] || [];
  combinations.push(...activityKeys);
  
  // Location-specific combinations
  if (location) {
    const locationKey = location.toLowerCase().replace(/\s+/g, '');
    const locationKeys = keywordDatabase.locations[locationKey as keyof typeof keywordDatabase.locations] || [];
    combinations.push(...locationKeys);
    
    // Create location + activity combinations
    combinations.push(
      `${primaryActivity} ${location}`,
      `${primaryActivity} lessons ${location}`,
      `${primaryActivity} schools ${location}`,
      `learn ${primaryActivity} ${location}`,
      `${primaryActivity} instructors ${location}`
    );
  }
  
  // Skill level combinations
  if (skillLevel) {
    combinations.push(
      `${skillLevel} ${primaryActivity} lessons`,
      `${skillLevel} ${primaryActivity} India`,
      `${primaryActivity} for ${skillLevel}s`
    );
  }
  
  // Context-specific keywords
  if (context) {
    switch (context) {
      case 'booking':
        combinations.push(...keywordDatabase.booking.map(keyword => 
          keyword.replace('water sports', primaryActivity)
        ));
        break;
      case 'conditions':
        combinations.push(...keywordDatabase.conditions.map(keyword =>
          keyword.includes('surf') ? keyword.replace('surf', primaryActivity) : keyword
        ));
        break;
      case 'equipment':
        combinations.push(...keywordDatabase.equipment.map(keyword =>
          keyword.replace('water sports', primaryActivity)
        ));
        break;
      case 'learning':
        combinations.push(...keywordDatabase.experience.map(keyword =>
          keyword.replace('water sports', primaryActivity)
        ));
        break;
    }
  }
  
  return [...new Set(combinations)]; // Remove duplicates
};

// Generate page-specific keyword strategies
export const generatePageKeywordStrategy = (pageType: string, params?: any) => {
  switch (pageType) {
    case 'home':
      return {
        primary: ["water sports India", "surf conditions India", "beach activities India"],
        secondary: ["water sports booking platform", "surf schools India", "beach safety India"],
        longtail: [
          "best water sports booking platform India",
          "real time surf conditions India",
          "certified water sports instructors India"
        ]
      };
      
    case 'explore':
      return {
        primary: ["beach conditions India", "surf reports India", "wave forecast India"],
        secondary: ["beach safety monitoring", "water sports locations", "surf spots India"],
        longtail: [
          "real time beach conditions India",
          "best surfing spots India with conditions",
          "safe water sports beaches India"
        ]
      };
      
    case 'book-now':
      return {
        primary: ["book water sports lessons", "water sports schools India", "surf lesson booking"],
        secondary: ["certified water sports instructors", "water sports packages", "online booking"],
        longtail: [
          "book professional water sports lessons India",
          "certified surf schools online booking",
          "instant confirmation water sports lessons"
        ]
      };
      
    case 'beach-detail':
      const beachName = params?.beachName || 'beach';
      const location = params?.location || 'India';
      return {
        primary: [`${beachName} conditions`, `${beachName} surfing`, `${location} water sports`],
        secondary: [`${beachName} wave report`, `${beachName} safety`, `${location} surf spots`],
        longtail: [
          `${beachName} real time surf conditions`,
          `${beachName} water sports activities`,
          `best time to surf ${beachName}`
        ]
      };
      
    case 'activity':
      const activity = params?.activity || 'water sports';
      const activityLocation = params?.location || 'India';
      return generateKeywordCombinations(activity, activityLocation, undefined, 'learning');
      
    default:
      return {
        primary: ["water sports India"],
        secondary: ["beach activities"],
        longtail: ["water sports activities India"]
      };
  }
};

// Keyword density optimization
export const optimizeKeywordDensity = (content: string, targetKeywords: string[]): {
  density: Record<string, number>;
  recommendations: string[];
} => {
  const wordCount = content.split(/\s+/).length;
  const density: Record<string, number> = {};
  const recommendations: string[] = [];
  
  targetKeywords.forEach(keyword => {
    const occurrences = (content.match(new RegExp(keyword, 'gi')) || []).length;
    const keywordDensity = (occurrences / wordCount) * 100;
    density[keyword] = keywordDensity;
    
    // Density recommendations
    if (keywordDensity < 0.5) {
      recommendations.push(`Increase usage of "${keyword}" (current: ${keywordDensity.toFixed(2)}%)`);
    } else if (keywordDensity > 3) {
      recommendations.push(`Reduce usage of "${keyword}" to avoid keyword stuffing (current: ${keywordDensity.toFixed(2)}%)`);
    }
  });
  
  return { density, recommendations };
};

// LSI (Latent Semantic Indexing) keyword suggestions
export const generateLSIKeywords = (primaryKeyword: string): string[] => {
  const lsiMap: Record<string, string[]> = {
    'surfing': [
      'wave riding', 'surf breaks', 'lineup', 'surf session', 'board riding',
      'ocean waves', 'surf culture', 'surf spots', 'surf forecast', 'surf community'
    ],
    'water sports': [
      'aquatic activities', 'marine sports', 'ocean recreation', 'beach activities',
      'nautical sports', 'water recreation', 'coastal activities', 'sea sports'
    ],
    'sup': [
      'paddle boarding', 'stand up paddle', 'paddle sports', 'board paddling',
      'SUP touring', 'paddle fitness', 'water paddling', 'balance boarding'
    ],
    'kitesurfing': [
      'kite boarding', 'wind sports', 'kite flying', 'power kiting',
      'wind powered', 'aerial sports', 'kite control', 'wind riding'
    ]
  };
  
  const baseKeyword = primaryKeyword.toLowerCase().split(' ')[0];
  return lsiMap[baseKeyword] || [];
};

// Competitor keyword analysis simulation
export const generateCompetitorKeywords = (industry: string = 'water-sports'): string[] => {
  const competitorKeywords = [
    'surf lessons', 'water sports training', 'beach activities booking',
    'surf schools', 'water sports equipment', 'ocean sports',
    'surf camps', 'water adventure', 'coastal tourism',
    'surf coaching', 'water sports holidays', 'beach experiences'
  ];
  
  return competitorKeywords;
};

// Content gap analysis
export const analyzeContentGaps = (currentKeywords: string[], targetKeywords: string[]): {
  missing: string[];
  opportunities: string[];
  covered: string[];
} => {
  const missing = targetKeywords.filter(keyword => 
    !currentKeywords.some(current => 
      current.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(current.toLowerCase())
    )
  );
  
  const covered = targetKeywords.filter(keyword =>
    currentKeywords.some(current =>
      current.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(current.toLowerCase())
    )
  );
  
  const opportunities = missing.filter(keyword => 
    keyword.includes('India') || 
    keyword.includes('lessons') || 
    keyword.includes('booking')
  );
  
  return { missing, opportunities, covered };
};