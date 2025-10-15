'use client';

import { useEffect } from 'react';
import { initMixpanel } from '../lib/analytics';

export default function AnalyticsInit() {
  useEffect(() => {
    initMixpanel();
  }, []);

  return null;
}

