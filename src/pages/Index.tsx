import React from 'react';
import { WelcomeHero } from '../components/Home/WelcomeHero';

export default function Index() {
  return <WelcomeHero onGetStarted={() => window.location.href = '/spark'} />;
}
