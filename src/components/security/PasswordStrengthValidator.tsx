
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PasswordStrength {
  score: number; // 0-4 (zxcvbn-like scoring)
  feedback: string[];
  crackTime: string;
  isAcceptable: boolean;
}

interface PasswordStrengthValidatorProps {
  password: string;
  onStrengthChange: (strength: PasswordStrength) => void;
  className?: string;
}

export const PasswordStrengthValidator: React.FC<PasswordStrengthValidatorProps> = ({
  password,
  onStrengthChange,
  className = ''
}) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    crackTime: 'instant',
    isAcceptable: false
  });

  useEffect(() => {
    const newStrength = calculatePasswordStrength(password);
    setStrength(newStrength);
    onStrengthChange(newStrength);
  }, [password, onStrengthChange]);

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (!pwd) {
      return {
        score: 0,
        feedback: ['Enter a password'],
        crackTime: 'instant',
        isAcceptable: false
      };
    }

    const feedback: string[] = [];
    let score = 0;
    let baseScore = 0;

    // Length scoring
    if (pwd.length >= 12) baseScore += 2;
    else if (pwd.length >= 8) baseScore += 1;
    else feedback.push('Use at least 8 characters');

    // Character variety
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const varietyCount = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;
    
    if (varietyCount >= 3) baseScore += 1;
    if (varietyCount === 4) baseScore += 1;
    
    if (!hasLower) feedback.push('Add lowercase letters');
    if (!hasUpper) feedback.push('Add uppercase letters');
    if (!hasNumbers) feedback.push('Add numbers');
    if (!hasSpecial) feedback.push('Add special characters (!@#$%^&*)');

    // Common patterns penalty
    const commonPatterns = [
      /123|abc|qwe/i,
      /password|admin|user/i,
      /(.)\1{2,}/, // Repeated characters
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(pwd)) {
        baseScore -= 1;
        if (pattern.source.includes('password|admin|user')) {
          feedback.push('Avoid common words like "password"');
        } else if (pattern.source.includes('123|abc|qwe')) {
          feedback.push('Avoid common sequences');
        } else {
          feedback.push('Avoid repeated characters');
        }
        break;
      }
    }

    // Final score calculation
    score = Math.max(0, Math.min(4, baseScore));

    // Crack time estimation (simplified)
    const crackTimes = [
      'instant',
      'seconds',
      'minutes',
      'hours',
      'centuries'
    ];

    const isAcceptable = score >= 3; // Require score of 3 or higher

    if (!isAcceptable && feedback.length === 0) {
      feedback.push('Password needs to be stronger');
    }

    return {
      score,
      feedback,
      crackTime: crackTimes[score] || 'unknown',
      isAcceptable
    };
  };

  const getStrengthLabel = (score: number): string => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[score] || 'Unknown';
  };

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (strength.score <= 2) return <XCircle className="h-4 w-4 text-red-500" />;
    if (strength.score === 3) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-medium">
            {getStrengthLabel(strength.score)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Crack time: {strength.crackTime}
        </span>
      </div>
      
      <Progress 
        value={(strength.score / 4) * 100} 
        className="h-2"
      />
      <div 
        className={`h-1 rounded-full ${getStrengthColor(strength.score)}`}
        style={{ width: `${(strength.score / 4) * 100}%` }}
      />
      
      {strength.feedback.length > 0 && (
        <Alert variant={strength.isAcceptable ? "default" : "destructive"}>
          <AlertDescription>
            <ul className="text-sm space-y-1">
              {strength.feedback.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
