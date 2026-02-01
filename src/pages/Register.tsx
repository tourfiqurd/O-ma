import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap, ArrowLeft, ArrowRight, Check, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { database } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

type Step = 1 | 2 | 3;

interface FormData {
  schoolName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  board: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    board: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.adminPassword !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const registrationsRef = ref(database, 'school_registrations');
      const newRegistrationRef = push(registrationsRef);

      await set(newRegistrationRef, {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      setIsSubmitting(false);
      setIsComplete(true);
      
      toast({
        title: "Registration Submitted",
        description: "Your school registration is pending approval.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      toast({
        title: "Registration Failed",
        description: "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    { number: 1, title: 'School Info' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Admin Account' },
  ];

  if (isComplete) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
        <div className="absolute inset-0 gradient-radial-glow opacity-50" />
        
        <div className="relative z-10 w-full max-w-md px-4 text-center">
          <div className="animate-scale-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 glow-primary">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Registration Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your school registration for <span className="text-primary font-medium">{formData.schoolName}</span> has been submitted successfully. 
              Our team will review your application and you'll receive an email once approved.
            </p>
            <div className="border-gradient p-[1px] rounded-xl mb-6">
              <div className="rounded-xl bg-card p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Status: Pending Approval</p>
                    <p className="text-xs text-muted-foreground">Typically reviewed within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/login">
              <Button className="w-full h-11 glow-primary-sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden py-8">
      <div className="absolute inset-0 gradient-radial-glow opacity-50" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 animate-fade-in-up">
          <Link to="/" className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">RMS</span>
          </Link>
          <h1 className="text-xl font-semibold">Register Your School</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                step >= s.number 
                  ? "bg-primary text-primary-foreground glow-primary-sm" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s.number ? <Check className="h-4 w-4" /> : s.number}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2 transition-all",
                  step > s.number ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="border-gradient p-[1px] rounded-2xl animate-fade-in-up">
          <div className="rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">{steps[step - 1].title}</h2>
            
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => updateField('schoolName', e.target.value)}
                      placeholder="Enter school name"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => updateField('registrationNumber', e.target.value)}
                      placeholder="School registration number"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">School Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="school@example.com"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 234-567-8900"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="board">Board / Affiliation *</Label>
                    <Select
                      value={formData.board}
                      onValueChange={(value) => updateField('board', value)}
                    >
                      <SelectTrigger className="input-glow">
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="State">State Board</SelectItem>
                        <SelectItem value="Custom">Other / Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Street address"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                        className="input-glow"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="State"
                        className="input-glow"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name *</Label>
                    <Input
                      id="adminName"
                      value={formData.adminName}
                      onChange={(e) => updateField('adminName', e.target.value)}
                      placeholder="Full name"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => updateField('adminEmail', e.target.value)}
                      placeholder="admin@example.com"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => updateField('adminPassword', e.target.value)}
                      placeholder="Create a password"
                      className="input-glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                      className="input-glow"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 glow-primary-sm"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 glow-primary-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
