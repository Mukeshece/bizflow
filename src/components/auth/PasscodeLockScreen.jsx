import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const DigitInput = ({ value, onChange, onKeyDown, inputRef }) => (
  <input
    ref={inputRef}
    type="password"
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    maxLength={1}
    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none bg-white"
  />
);

export default function PasscodeLockScreen({ onUnlock, correctPasscode }) {
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => refs[0].current?.focus(), 100);
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are filled
    if (value && index === 3 && newPasscode.every(digit => digit)) {
      setTimeout(() => handleUnlock(newPasscode), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      refs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      e.preventDefault();
      refs[index + 1].current?.focus();
    } else if (e.key === 'Enter') {
      handleUnlock(passcode);
    }
  };

  const handleUnlock = (codeArray = passcode) => {
    const enteredCode = codeArray.join('');
    if (enteredCode === correctPasscode) {
      onUnlock();
    } else {
      setError('Incorrect passcode. Please try again.');
      setPasscode(['', '', '', '']);
      setTimeout(() => refs[0].current?.focus(), 100);
    }
  };

  const handleForgotPasscode = () => {
    alert('Please contact your administrator to reset the passcode.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Enter your passcode</h2>
          
          <div className="flex justify-center space-x-3">
            {passcode.map((digit, index) => (
              <DigitInput
                key={index}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputRef={refs[index]}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button 
            variant="link" 
            className="text-blue-500 hover:text-blue-600 text-sm"
            onClick={handleForgotPasscode}
          >
            forgot passcode?
          </Button>
        </div>
      </div>
    </div>
  );
}