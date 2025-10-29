import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentModal } from "@/components/PaymentModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Heart, HeartHandshake, Users, BookOpen, Library, Coffee, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DonatePage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(500);
  const [donationPurpose, setDonationPurpose] = useState("General Support");
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const handleDonate = (amount: number, purpose: string) => {
    setDonationAmount(amount);
    setDonationPurpose(purpose);
    setShowPaymentModal(true);
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
          Support GleamVerse
        </h1>
        <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Your donations help us maintain and expand our digital library, ensuring free access to knowledge for everyone.
        </p>
      </div>

      <Tabs defaultValue="one-time" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="one-time">One-time Donation</TabsTrigger>
          <TabsTrigger value="projects">Support Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-time">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`border ${theme === 'dark' 
              ? 'border-blue-900/30 bg-slate-900/90 shadow-blue-500/10' 
              : 'border-blue-100 bg-white shadow-blue-200/20'} shadow-lg hover:shadow-xl transition-all`}>
              <CardHeader className="text-center pb-2">
                <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Basic Support
                </CardTitle>
                <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  ₹100
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <Heart className={`h-12 w-12 mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Help us keep the lights on and servers running.
                </p>
                <ul className={`text-sm space-y-2 mb-6 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                    Server maintenance
                  </li>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                    Basic operations
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleDonate(100, "Basic Support")}
                >
                  Donate ₹100
                </Button>
              </CardFooter>
            </Card>

            <Card className={`border relative ${theme === 'dark' 
              ? 'border-indigo-500/30 bg-gradient-to-b from-slate-900 to-indigo-950 shadow-indigo-500/20' 
              : 'border-indigo-200 bg-gradient-to-b from-white to-indigo-50 shadow-indigo-200/30'} shadow-lg hover:shadow-xl transition-all`}>
              <div className="absolute top-0 right-0 left-0">
                <div className={`text-xs font-medium py-1 text-center ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-indigo-500 text-white'}`}>
                  MOST POPULAR
                </div>
              </div>
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Supporter
                </CardTitle>
                <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  ₹500
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <HeartHandshake className={`h-12 w-12 mx-auto ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Help us grow our collection and improve the platform.
                </p>
                <ul className={`text-sm space-y-2 mb-6 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                    All Basic Support benefits
                  </li>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                    New book acquisitions
                  </li>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                    Platform improvements
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${theme === 'dark' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  onClick={() => handleDonate(500, "Supporter")}
                >
                  Donate ₹500
                </Button>
              </CardFooter>
            </Card>

            <Card className={`border ${theme === 'dark' 
              ? 'border-purple-900/30 bg-slate-900/90 shadow-purple-500/10' 
              : 'border-purple-100 bg-white shadow-purple-200/20'} shadow-lg hover:shadow-xl transition-all`}>
              <CardHeader className="text-center pb-2">
                <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Patron
                </CardTitle>
                <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  ₹1000
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <Library className={`h-12 w-12 mx-auto ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Become a patron and help us build the future of digital libraries.
                </p>
                <ul className={`text-sm space-y-2 mb-6 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                    All Supporter benefits
                  </li>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                    New feature development
                  </li>
                  <li className="flex items-center">
                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                    Community events
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${theme === 'dark' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                  onClick={() => handleDonate(1000, "Patron")}
                >
                  Donate ₹1000
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => handleDonate(0, "Custom Donation")}
              className={`${theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Custom Amount
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`border ${theme === 'dark' 
              ? 'border-emerald-900/30 bg-slate-900/90 shadow-emerald-500/10' 
              : 'border-emerald-100 bg-white shadow-emerald-200/20'} shadow-lg hover:shadow-xl transition-all`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <BookOpen className={`h-5 w-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  Expand Book Collection
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Help us add more books to our digital library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your donation will go directly toward acquiring new books and expanding our collection across various genres and subjects.
                </p>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} mb-4`}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Current progress</span>
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>65%</span>
                  </div>
                  <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-500'}`} style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>₹32,500 raised</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Goal: ₹50,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  onClick={() => handleDonate(500, "Book Collection Expansion")}
                >
                  Support This Project
                </Button>
              </CardFooter>
            </Card>

            <Card className={`border ${theme === 'dark' 
              ? 'border-amber-900/30 bg-slate-900/90 shadow-amber-500/10' 
              : 'border-amber-100 bg-white shadow-amber-200/20'} shadow-lg hover:shadow-xl transition-all`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                  Community Reading Programs
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Support reading initiatives for underserved communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your donation will fund reading programs that bring books and literacy resources to communities with limited access to educational materials.
                </p>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} mb-4`}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Current progress</span>
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>40%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'}`} style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>₹20,000 raised</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Goal: ₹50,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${theme === 'dark' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                  onClick={() => handleDonate(500, "Community Reading Programs")}
                >
                  Support This Project
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className={`mt-12 p-6 rounded-lg border ${theme === 'dark' 
        ? 'border-blue-900/30 bg-slate-900/90 shadow-blue-500/10' 
        : 'border-blue-100 bg-white shadow-blue-200/20'} shadow-lg max-w-3xl mx-auto`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Why Donate to GleamVerse?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <BookOpen className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Expand Knowledge Access
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your support helps us provide free access to books and educational resources for everyone.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Support Communities
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We bring reading resources to underserved communities and promote literacy.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <Coffee className={`h-5 w-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Keep GleamVerse Running
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your donations help cover our operational costs and server maintenance.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
              <Heart className={`h-5 w-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div>
              <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Show Your Support
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Every donation, no matter the size, shows your commitment to our mission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        amount={donationAmount} 
        purpose={donationPurpose}
      />
    </div>
  );
}

export default DonatePage;