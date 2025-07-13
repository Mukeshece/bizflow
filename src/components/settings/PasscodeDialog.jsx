import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

const DigitInputRow = ({ label, digits, onDigitChange, onKeyDown, refs }) => (
    <div className="space-y-2">
        {label && <Label className="text-left font-normal text-gray-700 block">{label}</Label>}
        <div className="flex justify-center space-x-3">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={refs[index]}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => onDigitChange(index, e.target.value)}
                    onKeyDown={(e) => onKeyDown(index, e)}
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                />
            ))}
        </div>
    </div>
);

const SuccessDialog = ({ open, onClose }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">BizFlow</h3>
          <p className="text-gray-600 mb-6">Passcode updated successfully. Application will restart now.</p>
          <Button onClick={onClose} className="px-8">OK</Button>
        </div>
      </DialogContent>
    </Dialog>
);


export default function PasscodeDialog({ open, onClose, onSave, isChanging, currentPasscodeValue }) {
    const [oldPasscode, setOldPasscode] = useState(['', '', '', '']);
    const [newPasscode, setNewPasscode] = useState(['', '', '', '']);
    const [confirmPasscode, setConfirmPasscode] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const refs = {
        old: [useRef(), useRef(), useRef(), useRef()],
        new: [useRef(), useRef(), useRef(), useRef()],
        confirm: [useRef(), useRef(), useRef(), useRef()],
    };

    useEffect(() => {
        if (open) {
            // Reset state and focus first input
            setOldPasscode(['', '', '', '']);
            setNewPasscode(['', '', '', '']);
            setConfirmPasscode(['', '', '', '']);
            setError('');
            setTimeout(() => {
                const firstRef = isChanging ? refs.old[0] : refs.new[0];
                firstRef.current?.focus();
            }, 100);
        }
    }, [open, isChanging]);

    const handleDigitChange = (index, value, passcode, setPasscode, nextRefs) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...passcode];
        newDigits[index] = value;
        setPasscode(newDigits);
        setError('');
        if (value && index < 3 && nextRefs[index + 1].current) {
            nextRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e, passcode, setPasscode, prevRefs) => {
        if (e.key === 'Backspace' && !passcode[index] && index > 0 && prevRefs[index - 1].current) {
            prevRefs[index - 1].current.focus();
        }
    };
    
    const handleSaveClick = () => {
        setError('');
        if (isChanging) {
            if (oldPasscode.join('') !== currentPasscodeValue) {
                setError("Old passcode is incorrect.");
                return;
            }
        }
        if (newPasscode.join('').length !== 4) {
             setError("New passcode must be 4 digits.");
             return;
        }
        if (newPasscode.join('') !== confirmPasscode.join('')) {
            setError("New passcodes do not match.");
            return;
        }

        setShowSuccess(true);
    };
    
    const handleSuccessClose = () => {
        setShowSuccess(false);
        onSave(newPasscode.join(''));
        onClose(); // Close main dialog after success
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader className="flex flex-row items-center justify-between pb-0">
                        <DialogTitle className="text-lg font-semibold">{isChanging ? 'Change Passcode' : 'Setup Pass Code'}</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                    </DialogHeader>
                    <div className="space-y-6 py-4 text-center">
                        {isChanging && (
                            <DigitInputRow
                                label="Old Passcode"
                                digits={oldPasscode}
                                onDigitChange={(i, v) => handleDigitChange(i, v, oldPasscode, setOldPasscode, refs.old)}
                                onKeyDown={(i, e) => handleKeyDown(i, e, oldPasscode, setOldPasscode, refs.old)}
                                refs={refs.old}
                            />
                        )}
                        <DigitInputRow
                            label="New Passcode"
                            digits={newPasscode}
                            onDigitChange={(i, v) => handleDigitChange(i, v, newPasscode, setNewPasscode, refs.new)}
                            onKeyDown={(i, e) => handleKeyDown(i, e, newPasscode, setNewPasscode, refs.new)}
                            refs={refs.new}
                        />
                        <DigitInputRow
                            label="Confirm Passcode"
                            digits={confirmPasscode}
                            onDigitChange={(i, v) => handleDigitChange(i, v, confirmPasscode, setConfirmPasscode, refs.confirm)}
                            onKeyDown={(i, e) => handleKeyDown(i, e, confirmPasscode, setConfirmPasscode, refs.confirm)}
                            refs={refs.confirm}
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={handleSaveClick} className="w-full sm:w-auto px-12">SAVE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <SuccessDialog open={showSuccess} onClose={handleSuccessClose} />
        </>
    );
}