import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let isInitialized = false;

export function initMixpanel() {
  if (isInitialized || !MIXPANEL_TOKEN) return;
  
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
    api_host: 'https://api-eu.mixpanel.com', // EU data center
  });
  
  isInitialized = true;
  console.log('[Analytics] Mixpanel initialized');
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!isInitialized) {
    console.warn('[Analytics] Mixpanel not initialized, skipping event:', eventName);
    return;
  }
  
  mixpanel.track(eventName, properties);
  console.log('[Analytics] Event tracked:', eventName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  
  mixpanel.identify(userId);
  if (properties) {
    mixpanel.people.set(properties);
  }
  console.log('[Analytics] User identified:', userId);
}

export function setUserProperties(properties: Record<string, unknown>) {
  if (!isInitialized) return;
  
  mixpanel.people.set(properties);
}

export function resetUser() {
  if (!isInitialized) return;
  
  mixpanel.reset();
}

// Event tracking helpers
export const analytics = {
  // Study button events
  studyClickedOnboarding: () => {
    trackEvent('Study Button Clicked', {
      source: 'onboarding',
      screen: 'onboarding_review',
    });
  },
  
  studyClickedHome: (setId?: string, setName?: string) => {
    trackEvent('Study Button Clicked', {
      source: 'home',
      screen: 'home',
      setId,
      setName,
    });
  },
  
  studyClickedSetDetails: (setId: string, setName: string) => {
    trackEvent('Study Button Clicked', {
      source: 'set_details',
      screen: 'set_details',
      setId,
      setName,
    });
  },
  
  // User lifecycle events
  onboardingStarted: () => {
    trackEvent('Onboarding Started');
  },
  
  onboardingCompleted: (learningLanguage: string, nativeLanguage: string) => {
    trackEvent('Onboarding Completed', {
      learningLanguage,
      nativeLanguage,
    });
  },
  
  // Card generation events
  cardsGenerated: (amount: number, complexity: string, source: string) => {
    trackEvent('Cards Generated', {
      amount,
      complexity,
      source,
    });
  },
  
  // Set management events
  setCreated: (setName: string) => {
    trackEvent('Set Created', {
      setName,
    });
  },
  
  cardCreated: (source: string) => {
    trackEvent('Card Created', {
      source,
    });
  },
};

