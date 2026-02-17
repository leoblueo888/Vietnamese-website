import React from 'react';

export interface LearningBox {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export interface PeaceStep {
  letter: string;
  heading: string;
  text: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Added GameResult interface to standardize data from games
export interface GameResult {
    duration: number; // in seconds
    accuracy_score: number;
    word: string;
    mistake?: {
        user_said: string;
        correct_way: string;
    } | null;
}

export interface AIFriend {
  name: string;
  avatarUrl: string;
  description: string;
  style: string;
}
