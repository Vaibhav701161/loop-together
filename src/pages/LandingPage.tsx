
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Globe, Shield, MessageSquare, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 overflow-x-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 md:pt-32 md:pb-40 relative">
        {/* Floating geometric shapes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-bit-purple/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-bit-orange/10 blur-3xl animate-pulse delay-700"></div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-heading leading-tight animate-fade-in">
              Decentralized. Trustless. <br className="hidden md:block" />Together.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-in delay-100">
              Empowering communities with blockchain-powered social engagement.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gradient-btn text-white px-8 py-6 h-auto text-lg rounded-xl neumorph animate-fade-in delay-200">
                <Link to="/login" className="flex items-center gap-2">
                  Join Beta <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 h-auto text-lg rounded-xl neumorph animate-fade-in delay-300">
                <Link to="#" className="flex items-center gap-2">
                  View Whitepaper
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center z-10">
            <div className="relative w-full max-w-md animate-fade-in">
              <img 
                src="/lovable-uploads/db257743-0e12-4773-be95-c677c49e8c78.png" 
                alt="BitBuddies" 
                className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-bit-purple/20 to-bit-pink/20 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold gradient-heading mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">Experience the next generation of social engagement with our blockchain-powered platform</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-bit-purple to-bit-pink w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">On-chain Reputation</h3>
              <p className="text-muted-foreground">Build and verify your digital identity with transparent on-chain reputation metrics</p>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-bit-orange to-bit-pink w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Token Rewards</h3>
              <p className="text-muted-foreground">Earn rewards for your contributions and engagement within the community</p>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-bit-purple to-bit-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Messaging</h3>
              <p className="text-muted-foreground">Communicate with end-to-end encryption and blockchain-level security</p>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-bit-pink to-bit-purple w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Governance</h3>
              <p className="text-muted-foreground">Participate in decision-making through decentralized governance proposals</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why BitBuddies Section */}
      <section className="bg-gradient-to-br from-bit-purple/5 to-bit-pink/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold gradient-heading mb-4">Why BitBuddies?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-bit-purple/10 p-2 rounded-lg">
                    <Shield className="text-bit-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Privacy First</h3>
                    <p className="text-muted-foreground">Your data belongs to you. Our platform ensures your privacy while maintaining transparency where it matters.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-bit-orange/10 p-2 rounded-lg">
                    <Globe className="text-bit-orange h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Complete Transparency</h3>
                    <p className="text-muted-foreground">All transactions and interactions are recorded on the blockchain, ensuring accountability and trust.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-bit-pink/10 p-2 rounded-lg">
                    <Users className="text-bit-pink h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Earning Potential</h3>
                    <p className="text-muted-foreground">Monetize your interactions and contributions while building meaningful connections.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-bit-purple/20 to-bit-pink/20 blur-3xl rounded-full"></div>
              
              {/* Abstract Illustration */}
              <div className="relative z-10 h-80 md:h-96 w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-bit-purple/30"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-bit-orange/30"></div>
                <div className="absolute left-32 top-32 w-24 h-24 rounded-full bg-bit-pink/30"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-bit-purple to-bit-pink flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">BB</span>
                    </div>
                    <p className="font-medium text-lg">The Future of Social Connectivity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center gradient-heading mb-16">Community Love</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
            <p className="italic text-muted-foreground mb-6">
              "BitBuddies has revolutionized how I connect with my crypto friends. The token incentives make engagement so much more rewarding!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-purple/20 flex items-center justify-center">
                <span className="font-bold text-bit-purple">AK</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Alex K.</h4>
                <p className="text-sm text-muted-foreground">Crypto Enthusiast</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
            <p className="italic text-muted-foreground mb-6">
              "The privacy-focused approach of BitBuddies gives me peace of mind while still allowing me to build my on-chain reputation. Game changer!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-orange/20 flex items-center justify-center">
                <span className="font-bold text-bit-orange">MC</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Maya C.</h4>
                <p className="text-sm text-muted-foreground">Web3 Developer</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
            <p className="italic text-muted-foreground mb-6">
              "I've been looking for a platform that combines social engagement with blockchain technology. BitBuddies nails it with their governance model."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-pink/20 flex items-center justify-center">
                <span className="font-bold text-bit-pink">TJ</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Tyler J.</h4>
                <p className="text-sm text-muted-foreground">DAO Contributor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-10">
        <div className="max-w-4xl mx-auto text-center bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-bit-purple/20 to-bit-pink/20 z-0"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-bit-orange/20 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-bit-purple/20 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold gradient-heading mb-6">Join the Movement</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be among the first to experience BitBuddies. Sign up for early access and receive exclusive benefits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-bit-purple"
              />
              <Button size="lg" className="gradient-btn text-white px-6 py-3 h-auto rounded-xl neumorph">
                Get Early Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 py-12 text-white/90">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">BitBuddies</h2>
              <p className="text-sm text-white/70">© 2025 BitBuddies. All rights reserved.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-3 text-white/90">Platform</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-white/70 hover:text-bit-purple">Home</Link></li>
                  <li><Link to="/features" className="text-white/70 hover:text-bit-purple">Features</Link></li>
                  <li><Link to="/pricing" className="text-white/70 hover:text-bit-purple">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-white/90">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/blog" className="text-white/70 hover:text-bit-purple">Blog</Link></li>
                  <li><Link to="/guide" className="text-white/70 hover:text-bit-purple">User Guide</Link></li>
                  <li><Link to="/faq" className="text-white/70 hover:text-bit-purple">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-white/90">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-white/70 hover:text-bit-purple">About Us</Link></li>
                  <li><Link to="/contact" className="text-white/70 hover:text-bit-purple">Contact</Link></li>
                  <li><Link to="/terms" className="text-white/70 hover:text-bit-purple">Terms</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0">
              <h3 className="font-semibold mb-3 text-center md:text-left text-white/90">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
