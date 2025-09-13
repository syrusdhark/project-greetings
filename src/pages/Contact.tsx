import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import SEOHead from "@/components/SEOHead";
import { ContextualNavigation } from "@/components/InternalLinkManager";
import StructuredDataManager from "@/components/StructuredDataManager";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.message;

  const faqData = [
    {
      question: "How do I book a water sports lesson?",
      answer: "You can browse available schools on our Book Now page, select your preferred activity and instructor, then complete your booking with a deposit."
    },
    {
      question: "Are the instructors certified?",
      answer: "Yes, all instructors on our platform are certified professionals with proper safety training and equipment."
    },
    {
      question: "What if weather conditions are bad?",
      answer: "We provide real-time weather and surf conditions. If conditions are unsafe, schools will reschedule your lesson at no extra cost."
    },
    {
      question: "Do you provide equipment?",
      answer: "Most schools include all necessary equipment in their lesson packages. Check individual school listings for specific details."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel up to 24 hours before your lesson for a full refund. Please check individual school policies for specific terms."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Contact Pelagos - Water Sports Platform Support"
        description="Get in touch with Pelagos for water sports inquiries, booking support, or partnership opportunities. Fast response from our team of water sports experts."
        keywords="contact Pelagos, water sports support, booking help, surf school partnerships, customer service India"
        canonical="https://pelagos.lovable.app/contact"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-ocean text-white py-20 pt-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Get in Touch
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Have questions about water conditions, need help with bookings, or want to partner with us? 
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Reach out to us through any of these channels. Our team is here 
                  to help you make the most of your water adventures.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          For general inquiries and support
                        </p>
                        <a 
                          href="mailto:booknow@pelgos.in" 
                          className="text-primary hover:underline font-medium"
                        >
                          booknow@pelgos.in
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Mon-Fri 9AM-6PM IST
                        </p>
                        <a 
                          href="tel:+919840157230" 
                          className="text-primary hover:underline font-medium"
                        >
                          9840157230
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Location</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          We're based in
                        </p>
                        <address className="text-primary not-italic">
                          Chennai, India
                        </address>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-ocean">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Send us a Message
                    </h2>
                    <p className="text-muted-foreground">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="ocean" 
                      size="lg" 
                      className="w-full"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      * Required fields. We'll respond within 24 hours.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Quick answers to common questions about Pelagos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">
                  How accurate are your condition reports?
                </h3>
                <p className="text-white/80 text-sm">
                  We source data from multiple reliable APIs including Stormglass and OpenWeather, 
                  updating conditions every 15 minutes for maximum accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">
                  Can I cancel my activity booking?
                </h3>
                <p className="text-white/80 text-sm">
                  Yes, most bookings can be cancelled up to 24 hours before your scheduled time. 
                  Check the specific cancellation policy for each activity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">
                  Do you cover beaches outside India?
                </h3>
                <p className="text-white/80 text-sm">
                  Currently, Pelagos focuses on Indian coastlines. We're planning to expand 
                  to other regions based on user demand.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">
                  How do I become a partner operator?
                </h3>
                <p className="text-white/80 text-sm">
                  We'd love to work with you! Send us a message with details about your business 
                  and services, and our partnership team will get in touch.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <ContextualNavigation 
        currentPage="contact"
        className="container mx-auto px-4 mb-8 py-6"
      />
      
      <StructuredDataManager 
        data={[{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqData.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }]}
      />

      <Footer />
    </div>
  );
};

export default Contact;