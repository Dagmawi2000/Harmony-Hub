import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, CircularProgress } from '@mui/material';

const MODES = [
  {
    label: 'Relax & Unwind',
    value: 'relax',
    steps: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 },
    ],
    description: '4-7-8 Breathing: Inhale 4s, Hold 7s, Exhale 8s.'
  },
  {
    label: 'Focus',
    value: 'focus',
    steps: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
    description: 'Box Breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.'
  },
  {
    label: 'Energize',
    value: 'energize',
    steps: [
      { label: 'Inhale', seconds: 2 },
      { label: 'Exhale', seconds: 2 },
    ],
    description: 'Fast Breathing: Inhale 2s, Exhale 2s.'
  },
];

function BreathingExercise() {
  const [mode, setMode] = useState('relax');
  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].steps[0].seconds);
  const [isActive, setIsActive] = useState(false);

  const currentMode = MODES.find((m) => m.value === mode);
  const currentStep = currentMode.steps[stepIdx];

  useEffect(() => {
    setStepIdx(0);
    setSecondsLeft(currentMode.steps[0].seconds);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (!isActive) return;
    if (secondsLeft === 0) {
      if (stepIdx < currentMode.steps.length - 1) {
        setStepIdx(stepIdx + 1);
        setSecondsLeft(currentMode.steps[stepIdx + 1].seconds);
      } else {
        setStepIdx(0);
        setSecondsLeft(currentMode.steps[0].seconds);
        setIsActive(false);
      }
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [isActive, secondsLeft, stepIdx, currentMode.steps]);

  const handleStart = () => setIsActive(true);
  const handleReset = () => {
    setIsActive(false);
    setStepIdx(0);
    setSecondsLeft(currentMode.steps[0].seconds);
  };

  return (
    <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 2 }}>
      <Tabs
        value={mode}
        onChange={(_, v) => setMode(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        {MODES.map((m) => (
          <Tab key={m.value} label={m.label} value={m.value} />
        ))}
      </Tabs>
      <Typography align="center" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
        {currentMode.description}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <CircularProgress
          variant="determinate"
          value={((currentStep.seconds - secondsLeft) / currentStep.seconds) * 100}
          size={120}
          thickness={4}
          sx={{ mb: 2, color: 'primary.main' }}
        />
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 1 }}>
          {currentStep.label}
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
          {secondsLeft}s
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleStart} disabled={isActive}>
            Start
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default BreathingExercise; 