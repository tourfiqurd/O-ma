import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Shield, 
  Users, 
  BookOpen,
  Award,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate dashboards for Super Admin, School Admin, Principal, Teachers, Students, and Parents.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track student performance, class averages, and identify areas for improvement instantly.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Role-based access control ensures data privacy and security for all users.'
    },
    {
      icon: BookOpen,
      title: 'Easy Marks Entry',
      description: 'Teachers can enter marks with auto-grade calculation and batch processing.'
    },
    {
      icon: Award,
      title: 'Automated Reports',
      description: 'Generate professional report cards and analytics with one click.'
    },
    {
      icon: Clock,
      title: 'Approval Workflow',
      description: 'Structured result approval process from teacher to principal to publication.'
    },
  ];

  const benefits = [
    'Reduce manual paperwork by 90%',
    'Instant result publication',
    'Parent-Teacher communication',
    'Historical performance tracking',
    'Custom grading systems',
    'Multi-school support',
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small schools just getting started',
      features: ['Up to 100 students', '3 teachers', 'Basic reports', 'Email support'],
      popular: false,
    },
    {
      name: 'Basic',
      price: '$49',
      period: 'per month',
      description: 'Great for growing schools with more needs',
      features: ['Up to 500 students', '20 teachers', 'Advanced reports', 'Priority support', 'Custom branding'],
      popular: false,
    },
    {
      name: 'Premium',
      price: '$99',
      period: 'per month',
      description: 'For schools that need everything',
      features: ['Unlimited students', 'Unlimited teachers', 'All features', '24/7 support', 'API access', 'Custom integrations'],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary-sm">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">RMS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="glow-primary-sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-radial-glow opacity-50" />
        <div className="absolute top-1/3 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center stagger-children">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="h-4 w-4" />
              Modern Result Management System
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Manage School Results
              <span className="block text-primary text-glow">Effortlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A powerful, multi-tenant platform for schools to manage exams, enter marks, 
              generate reports, and publish results with complete role-based access control.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 text-base glow-primary">
                  Register Your School
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="border-gradient p-[1px] rounded-2xl mx-auto max-w-4xl">
              <div className="rounded-2xl bg-card p-4 md:p-8">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50">
                  <div className="text-center">
                    <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface-elevated">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your school's academic results efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group border-gradient p-[1px] rounded-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="rounded-xl bg-card p-6 h-full transition-all duration-300 group-hover:bg-card/80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Schools Choose <span className="text-primary">RMS</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our platform is designed by educators for educators. We understand the 
                challenges of managing academic results and have built solutions to address them.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-gradient p-[1px] rounded-2xl">
              <div className="rounded-2xl bg-card p-8">
                <div className="space-y-4">
                  {[
                    { label: 'Schools Registered', value: '500+' },
                    { label: 'Results Published', value: '2M+' },
                    { label: 'Active Users', value: '50K+' },
                    { label: 'Uptime', value: '99.9%' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="text-2xl font-bold text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-surface-elevated">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your school's needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300",
                  plan.popular 
                    ? "border-2 border-primary bg-card glow-primary-sm" 
                    : "border border-border bg-card hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button 
                    className={cn(
                      "w-full",
                      plan.popular && "glow-primary-sm"
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have questions? We'd love to hear from you.
            </p>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="Your name" className="input-glow" />
                <Input type="email" placeholder="Your email" className="input-glow" />
              </div>
              <Input placeholder="Subject" className="input-glow" />
              <textarea 
                className="w-full h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring input-glow resize-none"
                placeholder="Your message"
              />
              <Button className="w-full glow-primary-sm">
                Send Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">RMS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Result Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
