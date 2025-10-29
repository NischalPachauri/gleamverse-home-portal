import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, FileText, Send, ArrowLeft, BookOpen, Mail, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function HelpPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    toast.success("Your message has been sent! We'll get back to you soon.");
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back to Library Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
      </div>

      <div className="text-center mb-10">
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Help & Support
        </h1>
        <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Find answers to common questions, browse our documentation, or contact our support team.
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>
        
        {/* FAQs Section */}
        <TabsContent value="faq">
          <Card className={`border ${theme === 'dark' 
            ? 'border-slate-800 bg-slate-900/90' 
            : 'border-slate-200 bg-white'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to the most common questions about GleamVerse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    How do I create an account?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    To create an account, click on the "Sign In" button in the top-right corner of the page. 
                    You can sign up using your email address or through a social media account. Follow the 
                    on-screen instructions to complete your registration.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    How do I bookmark a book?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    To bookmark a book, navigate to the book's detail page and click on the bookmark icon 
                    in the top-right corner of the book card. You can view all your bookmarked books in the 
                    "Bookmarks" section accessible from the navigation menu.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    How do I set reading goals?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    You can set reading goals in your profile section. Navigate to "Profile" from the 
                    navigation menu, then scroll to the "Reading Goals" section. Click on "Create New Goal" 
                    and follow the prompts to set your target number of books and timeframe.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    How do I make a donation?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    To make a donation, navigate to the "Donate" page from the navigation menu. Choose your 
                    preferred donation amount and purpose, then click the "Donate" button. You'll be redirected 
                    to our secure payment gateway where you can complete your transaction.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    Can I read books offline?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Yes, you can download books for offline reading. On the book's detail page, look for the 
                    "Download" button. Once downloaded, you can access the book through your device's file 
                    system or through our app's "Downloads" section.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    How do I change my account settings?
                  </AccordionTrigger>
                  <AccordionContent className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    To change your account settings, navigate to the "Profile" section from the navigation menu. 
                    There you'll find options to update your profile information, change your password, and 
                    manage your notification preferences.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documentation Section */}
        <TabsContent value="docs">
          <Card className={`border ${theme === 'dark' 
            ? 'border-slate-800 bg-slate-900/90' 
            : 'border-slate-200 bg-white'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                Documentation
              </CardTitle>
              <CardDescription>
                Comprehensive guides to help you get the most out of GleamVerse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Getting Started Guide */}
                <Card className={`border ${theme === 'dark' 
                  ? 'border-slate-700 bg-slate-800/50' 
                  : 'border-slate-200 bg-slate-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Learn how to navigate GleamVerse, create an account, and start reading.
                    </p>
                    <ul className={`text-sm space-y-2 list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>Creating your account</li>
                      <li>Navigating the library</li>
                      <li>Finding and reading books</li>
                      <li>Using the search function</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Account Management */}
                <Card className={`border ${theme === 'dark' 
                  ? 'border-slate-700 bg-slate-800/50' 
                  : 'border-slate-200 bg-slate-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      Account Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Learn how to manage your profile, preferences, and account settings.
                    </p>
                    <ul className={`text-sm space-y-2 list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>Updating profile information</li>
                      <li>Managing reading preferences</li>
                      <li>Setting reading goals</li>
                      <li>Privacy settings</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Reading Features */}
                <Card className={`border ${theme === 'dark' 
                  ? 'border-slate-700 bg-slate-800/50' 
                  : 'border-slate-200 bg-slate-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      Reading Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Discover all the features available while reading books on GleamVerse.
                    </p>
                    <ul className={`text-sm space-y-2 list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>Adjusting text size and theme</li>
                      <li>Using bookmarks and highlights</li>
                      <li>Taking notes</li>
                      <li>Background music options</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Troubleshooting */}
                <Card className={`border ${theme === 'dark' 
                  ? 'border-slate-700 bg-slate-800/50' 
                  : 'border-slate-200 bg-slate-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      Troubleshooting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Solutions to common issues you might encounter while using GleamVerse.
                    </p>
                    <ul className={`text-sm space-y-2 list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>Login problems</li>
                      <li>Book loading issues</li>
                      <li>Download errors</li>
                      <li>Payment troubleshooting</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact Us Section */}
        <TabsContent value="contact">
          <Card className={`border ${theme === 'dark' 
            ? 'border-slate-800 bg-slate-900/90' 
            : 'border-slate-200 bg-white'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                Contact Us
              </CardTitle>
              <CardDescription>
                Have a question or need assistance? Send us a message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Name
                        </label>
                        <Input 
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={contactForm.name}
                          onChange={handleInputChange}
                          required
                          className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email
                        </label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Your email address"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                          className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject
                      </label>
                      <Input 
                        id="subject"
                        name="subject"
                        placeholder="What is your inquiry about?"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                        required
                        className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message
                      </label>
                      <Textarea 
                        id="message"
                        name="message"
                        placeholder="Please describe your issue or question in detail"
                        rows={5}
                        value={contactForm.message}
                        onChange={handleInputChange}
                        required
                        className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
                
                <div>
                  <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Other Ways to Reach Us
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className={`h-5 w-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Email
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            support@gleamverse.com
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MessageSquare className={`h-5 w-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Live Chat
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Available Monday-Friday<br />9am-5pm EST
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className={`px-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                          >
                            Start Chat
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <HelpCircle className={`h-5 w-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            FAQ
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Check our frequently asked questions for quick answers.
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className={`px-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                            onClick={() => document.querySelector('[data-value="faq"]')?.click()}
                          >
                            View FAQs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HelpPage;